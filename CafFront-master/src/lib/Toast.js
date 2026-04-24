import Swal from "sweetalert2";
// import "sweetalert2/dist/sweetalert2.min.css";

const BaseToast = Swal.mixin({
  toast: true,
  position: "bottom-end",
  showConfirmButton: false,
  timer: 3500,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  },
});

export function showToast({ title, icon = "success", position, timer } = {}) {
  return BaseToast.fire({
    title,
    icon,
    ...(position ? { position } : {}),
    ...(timer ? { timer } : {}),
  });
}
