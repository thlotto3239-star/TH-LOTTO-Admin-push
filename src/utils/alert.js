import Swal from 'sweetalert2'

// Custom styling for the alerts
const customClass = {
  container: 'font-prompt',
  popup: 'rounded-3xl shadow-capsule border border-outline-variant/30',
  title: 'text-xl font-bold text-on-surface',
  htmlContainer: 'text-sm text-on-surface-variant',
  confirmButton: 'bg-primary text-on-primary rounded-full px-6 py-2.5 font-semibold hover:bg-primary/90 transition shadow-md',
  cancelButton: 'bg-surface-container text-on-surface-variant rounded-full px-6 py-2.5 font-semibold hover:bg-surface-container-high transition',
}

export const alert = {
  success: (title, text = '') => {
    return Swal.fire({
      icon: 'success',
      title,
      text,
      confirmButtonText: 'ตกลง',
      customClass,
      buttonsStyling: false,
    })
  },
  
  error: (title, text = '') => {
    return Swal.fire({
      icon: 'error',
      title,
      text,
      confirmButtonText: 'ปิด',
      customClass,
      buttonsStyling: false,
    })
  },
  
  confirm: async (title, text = 'คุณต้องการดำเนินการนี้ใช่หรือไม่?', confirmText = 'ยืนยัน', isDestructive = false) => {
    const result = await Swal.fire({
      icon: isDestructive ? 'warning' : 'question',
      title,
      text,
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: 'ยกเลิก',
      customClass: {
        ...customClass,
        confirmButton: isDestructive 
          ? 'bg-error text-on-error rounded-full px-6 py-2.5 font-semibold hover:bg-error/90 transition shadow-md mr-3'
          : 'bg-primary text-on-primary rounded-full px-6 py-2.5 font-semibold hover:bg-primary/90 transition shadow-md mr-3'
      },
      buttonsStyling: false,
      reverseButtons: true
    })
    return result.isConfirmed
  },

  loading: (title = 'กำลังดำเนินการ...') => {
    Swal.fire({
      title,
      allowOutsideClick: false,
      showConfirmButton: false,
      customClass,
      didOpen: () => {
        Swal.showLoading()
      }
    })
  },

  close: () => {
    Swal.close()
  }
}
