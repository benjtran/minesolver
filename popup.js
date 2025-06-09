console.log("popup.js loaded");

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("btn");
  btn.addEventListener("click", () => {
    console.log("Button clicked");
  });
});