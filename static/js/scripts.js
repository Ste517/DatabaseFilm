var r = document.querySelector(':root');
r.style.setProperty('--theme', 'dark');

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
    document.getElementsByClassName('cookieadvise').item(0).style.display = 'none';
}

var cookieTheme = getCookie("theme");
if (cookieTheme == "dark") {
    r.style.setProperty('--theme', 'dark');
    darkTheme();
    var slider = document.getElementsByClassName("switch").item(0);
    if (slider && slider.children.item(0)) {
        slider.children.item(0).checked = false;
    }
} else if (cookieTheme == "light") {
    r.style.setProperty('--theme', 'light');
    lightTheme();
    var slider = document.getElementsByClassName("switch").item(0);
    if (slider && slider.children.item(0)) {
        slider.children.item(0).checked = true;
    }
} else {
    darkTheme();
    var slider = document.getElementsByClassName("switch").item(0);
    if (slider && slider.children.item(0)) {
        slider.children.item(0).checked = false;
    }
    setCookie("theme", "dark", 30);
}

function themeSwitch() {
    // get the current theme
    var currentTheme = window.getComputedStyle(document.documentElement).getPropertyValue('--theme');
    // if the current theme is dark, switch to light
    if (currentTheme == 'dark') {
        r.style.setProperty('--theme', 'light');
        setCookie("theme", "light", 30);
        lightTheme();
    }
    // if the current theme is light, switch to dark
    else {
        r.style.setProperty('--theme', 'dark');
        setCookie("theme", "dark", 30);
        darkTheme();
    }
}

function lightTheme() {
    r.style.setProperty('--1', '#d5d5d5ff');
    r.style.setProperty('--2', '#ffffffff');
    r.style.setProperty('--3', '#757575ff');
    r.style.setProperty('--4', '#b6b6b6ff');
    r.style.setProperty('--5', '#858585ff');
    r.style.setProperty('--6', '#b1b1b1ff');
    r.style.setProperty('--7', '#414141ff');
    r.style.setProperty('--8', '#2f2f2fff');
    r.style.setProperty('--9', '#111111ff');
    r.style.setProperty('--10', '#000000ff');
}

function darkTheme() {
    r.style.setProperty('--1', '#111111ff');
    r.style.setProperty('--2', '#161723ff');
    r.style.setProperty('--3', '#0d0c34ff');
    r.style.setProperty('--4', '#0f0c75ff');
    r.style.setProperty('--5', '#16144fff');
    r.style.setProperty('--6', '#29275aff');
    r.style.setProperty('--7', '#4e4d6fff');
    r.style.setProperty('--8', '#747384ff');
    r.style.setProperty('--9', '#999999ff');
    r.style.setProperty('--10', '#ffffffff');
}

function closeCookies() {
    document.getElementsByClassName('cookieadvise').item(0).style.display = 'none';
    setCookie("cookie", "true", 7)
}

function apriModal(elemento) {
    // 1. Recuperiamo i dati dalle "tasche" del bottone cliccato
    var titolo = elemento.getAttribute("data-titolo");
    var trama = elemento.getAttribute("data-trama");
    var posterUrl = elemento.getAttribute("data-poster");
    var anno = elemento.getAttribute("data-anno");
    
    // 2. Inseriamo i dati dentro la scatola HTML
    document.getElementById("modal-titolo").innerText = titolo;
    document.getElementById("modal-anno").innerText = '(' + anno + ')';
    document.getElementById("modal-trama").innerText = trama;
        
    // Per l'immagine, controlliamo se c'è un URL valido
    var imgTag = document.getElementById("modal-poster");
    if (posterUrl && posterUrl !== "None") {
        imgTag.src = posterUrl;
        imgTag.style.display = "block";
    } else {
        // Se non c'è poster, nascondiamo l'immagine o mettiamo un placeholder
        imgTag.style.display = "none"; 
    }

    // 3. Mostriamo il modale cambiando il CSS
    document.getElementById("modal-overlay").style.display = "flex";
}

// Funzione per CHIUDERE il modale
function chiudiModal() {
    document.getElementById("modal-overlay").style.display = "none";
}

// Chiudi anche se clicco fuori dalla scatola bianca (sullo sfondo scuro)
window.onclick = function(event) {
    var overlay = document.getElementById("modal-overlay");
    if (event.target == overlay) {
        chiudiModal();
    }
}

// Funzione FILTRO LIVE per le liste
function filtraLista(inputId, listaId) {
    // 1. Prendo input e lo normalizzo (maiuscolo)
    var input = document.getElementById(inputId);
    var filtro = input.value.toUpperCase();

    // 2. Prendo il contenitore e le card
    var listaContainer = document.getElementById(listaId);
    var cards = listaContainer.getElementsByClassName("item-card");

    // 3. Ciclo su tutte le card
    for (var i = 0; i < cards.length; i++) {
        // Cerco il testo dentro la card (titolo, autore, ecc.)
        var testoCard = cards[i].textContent || cards[i].innerText;
        
        // Se il testo contiene la ricerca -> mostra, altrimenti -> nascondi
        if (testoCard.toUpperCase().indexOf(filtro) > -1) {
            cards[i].style.display = ""; 
        } else {
            cards[i].style.display = "none";
        }
    }
}

function apriModalVoto(id, titolo, tipo) {
    document.getElementById('modal-voto').style.display = 'flex';
    document.getElementById('voto-titolo').innerText = titolo;
    document.getElementById('input-voto-id').value = id;
    document.getElementById('input-voto-tipo').value = tipo; // 'film' o 'musica'
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
    
    // Logica per cambiare il titolo
    var titoloModale = document.querySelector('#modal-voto h2');
    if (giaVotato) {
        titoloModale.innerText = "Modifica il tuo voto";
    } else {
        titoloModale.innerText = "Dai un voto";
    }
}