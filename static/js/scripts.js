var r = document.querySelector(':root');

// Mobile Menu Toggle
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenu.classList.toggle('open');
}

// Close mobile menu on resize
window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
        const mobileMenu = document.getElementById('mobile-menu');
        if (mobileMenu && mobileMenu.classList.contains('open')) {
            mobileMenu.classList.remove('open');
        }
    }
});

function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    let expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

const getCookie = (name) => (
    document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop() || ''
)

var cookieAccepted = getCookie("cookie")
if (cookieAccepted == "true") {
    const cookieBanner = document.getElementsByClassName('cookieadvise').item(0);
    if (cookieBanner) cookieBanner.style.display = 'none';
}

// Theme Initialization on Load
document.addEventListener('DOMContentLoaded', function() {
    // Sync checkbox state with current theme
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const isDark = currentTheme === 'dark';
    // We will update the button icon later, but for now we might still have the checkbox
    // or we are moving to a button. The plan is to replace the UI.
    // So I will just leave this empty for now or minimal until I implement the UI.
    // If we still had the checkbox:
    // var sliders = document.querySelectorAll(".switch input");
    // sliders.forEach(slider => slider.checked = isDark);
});

function themeSwitch() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    // Dispatch event for UI updates if needed
    window.dispatchEvent(new Event('theme-change'));
}

function closeCookies() {
    document.getElementsByClassName('cookieadvise').item(0).style.display = 'none';
    setCookie("cookie", "true", 7)
}

function apriModal(elemento) {
    var titolo = elemento.getAttribute("data-titolo");
    var trama = elemento.getAttribute("data-trama");
    var posterUrl = elemento.getAttribute("data-poster");
    var anno = elemento.getAttribute("data-anno");
    
    document.getElementById("modal-titolo").innerText = titolo;
    document.getElementById("modal-anno").innerText = anno ? '(' + anno + ')' : '';
    document.getElementById("modal-trama").innerText = trama;
        
    var imgTag = document.getElementById("modal-poster");
    if (posterUrl && posterUrl !== "None" && posterUrl !== "") {
        imgTag.src = posterUrl;
        imgTag.style.display = "block";
    } else {
        imgTag.style.display = "none"; 
    }

    document.getElementById("modal-overlay").style.display = "flex";
}

function chiudiModal() {
    document.getElementById("modal-overlay").style.display = "none";
}

window.onclick = function(event) {
    var overlay = document.getElementById("modal-overlay");
    var overlayVoto = document.getElementById("modal-voto");
    if (event.target == overlay) {
        chiudiModal();
    }
    if (event.target == overlayVoto) {
        chiudiModalVoto();
    }
}

function filtraLista(inputId, listaId) {
    var input = document.getElementById(inputId);
    var filtro = input.value.toUpperCase();

    var listaContainer = document.getElementById(listaId);
    var cards = listaContainer.getElementsByClassName("item-card");

    for (var i = 0; i < cards.length; i++) {
        var testoCard = cards[i].textContent || cards[i].innerText;
        
        if (testoCard.toUpperCase().indexOf(filtro) > -1) {
            cards[i].style.display = ""; 
        } else {
            cards[i].style.display = "none";
        }
    }
}

function chiudiModalVoto() {
    document.getElementById('modal-voto').style.display = 'none';
}

function updateSort(param, value) {
    var url = new URL(window.location.href);
    url.searchParams.set(param, value);
    window.location.href = url.toString();
}

function apriModalVoto(id, titolo, tipo, giaVotato) {
    document.getElementById('modal-voto').style.display = 'flex';
    document.getElementById('input-voto-id').value = id;
    document.getElementById('input-voto-tipo').value = tipo;
    document.getElementById('voto-titolo').innerText = titolo;
    
    var titoloModale = document.querySelector('#modal-voto h2');
    if (giaVotato) {
        titoloModale.innerText = "Modifica il tuo voto";
    } else {
        titoloModale.innerText = "Dai un voto";
    }
}
