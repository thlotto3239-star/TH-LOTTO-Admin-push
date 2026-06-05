-- Fix: fn_settle_instant_draw ต้องอัปเดต instant_draws.status = 'SETTLED' หลัง settle
-- ก่อนหน้านี้ draws ค้างเป็น PENDING ตลอดแม้ settle เสร็จแล้ว

CREATE OR REPLACE FUNCTION public.fn_settle_instant_draw(p_draw_id bigint)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_result_6d   text;
  v_bet         RECORD;
  v_is_win      boolean;
  v_win_amount  numeric;
  v_settled     int := 0;
  v_rate        numeric;
  v_sel         jsonb;
  v_total_picks int;
  v_amount_per  numeric;
BEGIN
  SELECT result_6d INTO v_result_6d
  FROM public.instant_draws
  WHERE draw_id = p_draw_id;

  IF v_result_6d IS NULL THEN RETURN 0; END IF;

  FOR v_bet IN
    SELECT id, user_id, bet_type, numbers, amount, payout_rate
    FROM public.instant_bets
    WHERE draw_id = p_draw_id AND status = 'PENDING'
    FOR UPDATE SKIP LOCKED
  LOOP
    v_is_win     := false;
    v_win_amount := 0;
    v_rate       := v_bet.payout_rate;

    CASE v_bet.bet_type
      WHEN '2top' THEN
        v_is_win := (v_bet.numbers = substring(v_result_6d, 5, 2));
      WHEN '2bottom' THEN
        v_is_win := (v_bet.numbers = substring(v_result_6d, 5, 2));
      WHEN '3top' THEN
        v_is_win := (v_bet.numbers = substring(v_result_6d, 4, 3));
      WHEN '3toad' THEN
        IF length(v_bet.numbers) = 3 THEN
          v_is_win := (
            (SELECT string_agg(c,'' ORDER BY c) FROM unnest(string_to_array(v_bet.numbers, NULL)) c)
            =
            (SELECT string_agg(c,'' ORDER BY c) FROM unnest(string_to_array(substring(v_result_6d, 4, 3), NULL)) c)
          );
        END IF;
      WHEN '3front' THEN
        v_is_win := (v_bet.numbers = substring(v_result_6d, 1, 3));
      WHEN '3back' THEN
        v_is_win := (v_bet.numbers = substring(v_result_6d, 4, 3));
      WHEN '6straight' THEN
        v_is_win := (v_bet.numbers = v_result_6d);
      WHEN 'pin_top' THEN
        BEGIN
          v_sel := v_bet.numbers::jsonb;
          v_is_win := (
            (v_sel ? 'hundreds' AND v_sel->'hundreds' @> to_jsonb(substring(v_result_6d,4,1)::int))
            OR (v_sel ? 'tens'  AND v_sel->'tens'     @> to_jsonb(substring(v_result_6d,5,1)::int))
            OR (v_sel ? 'units' AND v_sel->'units'    @> to_jsonb(substring(v_result_6d,6,1)::int))
          );
        EXCEPTION WHEN others THEN v_is_win := false;
        END;
      WHEN 'pin_bottom' THEN
        BEGIN
          v_sel := v_bet.numbers::jsonb;
          v_is_win := (
            (v_sel ? 'tens'  AND v_sel->'tens'  @> to_jsonb(substring(v_result_6d,5,1)::int))
            OR (v_sel ? 'units' AND v_sel->'units' @> to_jsonb(substring(v_result_6d,6,1)::int))
          );
        EXCEPTION WHEN others THEN v_is_win := false;
        END;
      ELSE
        v_is_win := false;
    END CASE;

    IF v_is_win THEN
      IF v_bet.bet_type IN ('pin_top', 'pin_bottom') THEN
        BEGIN
          v_sel := v_bet.numbers::jsonb;
          v_total_picks :=
            COALESCE(jsonb_array_length(v_sel->'hundreds'), 0) +
            COALESCE(jsonb_array_length(v_sel->'tens'),     0) +
            COALESCE(jsonb_array_length(v_sel->'units'),    0);
          IF v_total_picks > 0 THEN
            v_amount_per := v_bet.amount / v_total_picks::numeric;
            IF v_bet.bet_type = 'pin_top' THEN
              IF v_sel ? 'hundreds' AND v_sel->'hundreds' @> to_jsonb(substring(v_result_6d,4,1)::int) THEN
                v_win_amount := v_win_amount + v_amount_per * v_rate;
              END IF;
              IF v_sel ? 'tens' AND v_sel->'tens' @> to_jsonb(substring(v_result_6d,5,1)::int) THEN
                v_win_amount := v_win_amount + v_amount_per * v_rate;
              END IF;
              IF v_sel ? 'units' AND v_sel->'units' @> to_jsonb(substring(v_result_6d,6,1)::int) THEN
                v_win_amount := v_win_amount + v_amount_per * v_rate;
              END IF;
            ELSE
              IF v_sel ? 'tens' AND v_sel->'tens' @> to_jsonb(substring(v_result_6d,5,1)::int) THEN
                v_win_amount := v_win_amount + v_amount_per * v_rate;
              END IF;
              IF v_sel ? 'units' AND v_sel->'units' @> to_jsonb(substring(v_result_6d,6,1)::int) THEN
                v_win_amount := v_win_amount + v_amount_per * v_rate;
              END IF;
            END IF;
          END IF;
        EXCEPTION WHEN others THEN
          v_win_amount := 0;
        END;
      ELSE
        v_win_amount := v_bet.amount * v_rate;
      END IF;
    END IF;

    v_win_amount := floor(v_win_amount);

    IF v_win_amount > 0 THEN
      UPDATE public.instant_bets
        SET status = 'WIN', winnings = v_win_amount, is_win = TRUE, settled_at = now()
        WHERE id = v_bet.id;
      UPDATE public.wallets
        SET balance   = balance + v_win_amount,
            total_won = COALESCE(total_won, 0) + v_win_amount,
            updated_at = now()
        WHERE user_id = v_bet.user_id;
    ELSE
      UPDATE public.instant_bets
        SET status = 'LOSE', winnings = 0, is_win = FALSE, settled_at = now()
        WHERE id = v_bet.id;
    END IF;

    v_settled := v_settled + 1;
  END LOOP;

  -- อัปเดต instant_draws.status = 'SETTLED' หลัง settle bets เสร็จ
  UPDATE public.instant_draws
    SET status = 'SETTLED'
    WHERE draw_id = p_draw_id;

  RETURN v_settled;
END;
$function$;
