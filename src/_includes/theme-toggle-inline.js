(()=>{var r="theme-preference",l='{% include "svg/sun.svg" %}',n='{% include "svg/moon.svg" %}',s=()=>{e.value=e.value==="light"?"dark":"light",document.querySelector("[theme-toggle]").querySelector("span").innerHTML=e.value==="light"?l:n,a()},i=()=>localStorage.getItem(r)?localStorage.getItem(r):window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light",a=()=>{localStorage.setItem(r,e.value),o()},o=()=>{document.firstElementChild.setAttribute("data-theme",e.value)},e={value:i()};o();window.onload=()=>{let t=document.querySelector("[theme-toggle]"),c=document.querySelector("[data-theme-switcher]");c&&(c.removeAttribute("hidden"),o(),t.addEventListener("click",s),t.querySelector("span").innerHTML=e.value==="light"?l:n)};window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",({matches:t})=>{e.value=t?"dark":"light",a()});})();
