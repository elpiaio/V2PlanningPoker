//lobby elements
var containerPlayer = document.querySelector("#div-players");
var div_lobby = document.querySelector("#div-lobby");
var div_lobby_results = document.querySelector(".lobby_votacao");

//botao do login
var botaoLogin = document.querySelector("#buttonSend-login");
var minhaSection = document.querySelector("#section-login");
var input_login = document.querySelector("#LoginNome");

//elemento do icon
var eyeIcon = document.getElementById('eyeIcon');

//elementos do user-informations da sidebar
var h2UserInformation = document.getElementById("sidebar-user-informations-user-name");

//botão contabilizarVotos
var containerBotao = document.getElementById("planning-poker-lobby-sidebar-adminButton");

//container dos resultados
var containerResults = document.getElementById("lobby_votacao");

const currentDate = new Date();
const user = { id: "", name: "", votou: false, idxuser: null, isAdmin: false }

//will
const serverData = { "Media": 0 }
var defaultObject =
{
    user: user,
    serverData: serverData
}
//will

let userList = [];




var userteste = defaultObject.user;
var userteste = defaultObject.serverData;

let idUsuario
let nameUsuario
let votouUsuario = false
let exibir = false
let adm = false
var media = 0

const socket = new WebSocket('ws://localhost:3000');

socket.addEventListener('open', (event) => {    // Evento 'open' do WebSocker e envia o user
    console.log('Conectado ao servidor WebSocket');
    // Enviar informações do usuário para o servidor

    if (user.name != "") {
        socket.send(JSON.stringify(user));
    }
});

botaoLogin.addEventListener("click", function () { // Adiciona um ouvinte de evento de clique ao botão de login

    if (input_login.value != "") {
        //para o server
        user.name = input_login.value
        user.id = currentDate.getMilliseconds();

        //para manipulação no index
        idUsuario = user.id
        nameUsuario = user.name
        h2UserInformation.innerText = nameUsuario;

        socket.send(JSON.stringify(user));  // Agora, o evento open será acionado antes dessa linha

        minhaSection.style.display = "none"
        div_lobby.style.display = "flex"

    }
    else {
        alert("preencha o campo")
    }
});

function montarUsersOnline(userList) {// Função para montar aa lista de usuários online:
    containerPlayer.innerHTML = ``;
    userList.forEach(x => {
        containerPlayer.innerHTML += `
            <p class="user-lobby-ativo">
                ${x.isAdmin ? `<i class="ph ph-user-circle-gear"></i>` : `<i class="ph ph-user"></i>`}
                ${x.name} 
                ${x.votou ? `  <i class="ph ph-check-circle"></i>` : ``}
                ${exibir ? `   ${x.idxuser}` : ``}
            </p>
            <br>
        `;
    })
}


function adminConfigurations() { //algumas configurações e funcionalidades do Admin

    if (userList[0].isAdmin == false) { //validação para descobrir o admin(primeiro usuario)
        userList[0].isAdmin = true;
        adm = true
        containerBotao.innerHTML = ``;
        containerBotao.innerHTML = `<button type="button" title="Contabilizar Votos" id="cardEncerrar" onclick="contabilizandoVotos()" class="btn-lobby-Encerrar"><strong><i class="ph ph-arrow-square-out"></i></strong></button>
                                    <button type="button" title="Exibir votos" id="eyeIcon" onclick="exibirVotos()" class="btn-lobby-Encerrar"><strong><i class="ph ph-eye-slash"></i></strong></button>
                                    <button type="button" title="Nova Votação" id="refrechIcon" onclick="zerarVotos()" class="btn-lobby-Encerrar"><strong><i class="ph ph-arrows-counter-clockwise"></i></strong></button>
                                `;

        socket.send(JSON.stringify(userList[0]));
    }
}


socket.addEventListener('message', (event) => { //retorna a lista de usuarios do servidor
    userList = JSON.parse(event.data);
    console.log('tamanho:', userList.length, 'Lista de usuários conectados:', userList);


    adminConfigurations(userList)

    // Atualize a interface do usuário com a lista de usuários
    // Exemplo: renderizar a lista em uma div ou outra parte da página
    // ...

    montarUsersOnline(userList)


    // Aqui você pode notificar o usuário sobre a entrada ou saída de outros usuários
    // Exemplo: mostrar uma notificação
    // ...
});



socket.addEventListener('close', (event) => { // Evento 'close' do WebSocket:
    console.log('Conexão fechada');
});



function magianegra(event) { //seleciona o valor que foi votado pelo usuario e muda o status de voto
    const idx = event.attributes.idx.value;

    userList = userList.map(usuario => {
        // Se o id do usuário for igual ao id do usuário atual, modifica o valor de votou para true
        if (usuario.id === idUsuario) {
            return { ...usuario, idxuser: idx };
        } else {
            return usuario;
        }
    });

    userList.forEach((usuario) => {
        if (usuario.id == idUsuario) {
            socket.send(JSON.stringify(usuario));
        }
    })

    montarUsersOnline(userList)
    //socket.dispatchEvent(new Event("message"))
}




function exibirVotos() { //admin tem a opção de exibir os votos ou nao

    if (adm === true) {
        if (exibir == false) {
            exibir = true
        } else {
            exibir = false
        }
        montarUsersOnline(userList)
    }
}


function montandoContabilizador() {  // resultado da votação votação
    div_lobby_results.style.display = "flex";
    containerResults.innerHTML = ``;
    containerResults.innerHTML += `
    <img src="../images/header_logo.png" alt="">
    <br>
    <br>
    <br>
        <h1 class="h1ResultsIntro"><strong>Média da votação!</strong></h1>
        <h1 class="h1Results"><strong>${media}</strong></h1>
        <br>
        <br>
        <br>
        <br>
        <button class="btnCloseResults" id="btnCloseResults" onclick="CloseResults()"><i class="ph ph-arrow-arc-right"></i></button>
    `;
}


var clicouContab = false
function contabilizandoVotos() { //abre a tabela de resultados
    console.log("vai tomar no teu cu");

    var soma = 0;
    var contador = 0;
    userList.forEach((fdp) => {
        if (fdp.idxuser != "cafe") {
            soma += Number(fdp.idxuser)
            contador++;
        }
    })
    media = soma / contador;

    montandoContabilizador()

    console.log(soma)
    console.log(media)
}


function CloseResults() {  //fecha a tabela de resultados
    div_lobby_results.style.display = "none";
}



function zerarVotos() {
    userList = userList.map(usuario => {
        return { ...usuario, idxuser: null, votou:false};
    });

    userList.forEach((usuario) => {
        socket.send(JSON.stringify(usuario));
    })
}