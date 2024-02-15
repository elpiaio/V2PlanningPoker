
//lobby elements
var containerPlayer = document.querySelector("#div-players");
var div_lobby = document.querySelector("#div-lobby");
var div_lobby_results = document.querySelector(".lobby_votacao");

//botao do login
var botaoLogin = document.querySelector("#buttonSend-login");
var minhaSection = document.querySelector("#section-login");
var input_login = document.querySelector("#LoginNome");
var input_senha_login = document.querySelector("#loginSenha");

//elemento do icon
var eyeIcon = document.getElementById('eyeIcon');

//elementos do user-informations da sidebar
var h2UserInformation = document.getElementById("sidebar-user-informations-user-name");

//botão contabilizarVotos
var containerBotao = document.getElementById("planning-poker-lobby-sidebar-adminButton");

//container dos resultados
var containerResults = document.getElementById("lobby_votacao");

const currentDate = new Date();
const user = { id: "", name: "", votou: false, idxuser: null, isAdmin: false, refreshAdm: false, exibir: false, contador: false }

let userList = [];

var soma = 0;
let exibirVoto
let idUsuario
let nameUsuario
let votouUsuario = false
let adm = false
var media = 0
var abrirContabilizador = false

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

        if (input_senha_login.value != "") {
            user.isAdmin = true
        }

        socket.send(JSON.stringify(user));  // Agora, o evento open será acionado antes dessa linha

        minhaSection.style.display = "none"
        div_lobby.style.display = "flex"

    }
    else {
        alert("preencha o campo")
    }
});

function montandoContabilizador() {  // resultado da votação votação
    if(userList.contador == true){
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
        abrirContabilizador = false;
    }
}

function montarUsersOnline(userList) {// Função para montar aa lista de usuários online:
    containerPlayer.innerHTML = ``;
    userList.forEach(x => {
        containerPlayer.innerHTML += `
            <p class="user-lobby-ativo">
                ${x.isAdmin ? `<i class="ph ph-user-circle-gear"></i>` : `<i class="ph ph-user"></i>`}
                ${x.name} 
                ${x.votou ? `  <i class="ph ph-check-circle"></i>` : ``}
                ${x.exibir && x.idxuser ? `${x.idxuser}` : ``}
            </p>
            <br>
        `;
    })
}

function adminConfigurations() { //algumas configurações e funcionalidades do Admin

    if (input_senha_login.value != "") { //validação para descobrir o admin(primeiro usuario)
        adm = true
        containerBotao.innerHTML = ``;
        containerBotao.innerHTML = `<button type="button" title="Contabilizar Votos" id="cardEncerrar" onclick="contabilizandoVotos()" class="btn-lobby-Encerrar"><strong><i class="ph ph-arrow-square-out"></i></strong></button>
                                    <button type="button" title="Exibir votos" id="eyeIcon" onclick="exibirVotos()" class="btn-lobby-Encerrar"><strong><i class="ph ph-eye-slash"></i></strong></button>
                                    <button type="button" title="Nova Votação" id="refrechIcon" onclick="zerarVotos()" class="btn-lobby-Encerrar"><strong><i class="ph ph-arrows-counter-clockwise"></i></strong></button>
                                `;
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

    montandoContabilizador()

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

function contabilizandoVotos() { //abre a tabela de resultados
    console.log("vai tomar no teu cu");
    var i = 0;
    userList.forEach((fdp) => {
        if (fdp.idxuser != "cafe") {
            soma += Number(fdp.idxuser)
            i++;
        }
    })
    media = soma / i;
    media = media.toFixed(1);
    
    abrirContabilizador = true
    
    const usuariosAtualizados = userList.map(usuario => {
        if (usuario.isAdmin) {
            return { ...usuario, contador: true };
        }
        return usuario;
    });

    usuariosAtualizados.forEach(usuario => {
        if (usuario.isAdmin) {
            // Supondo que 'socket' esteja definido em outro lugar
            socket.send(JSON.stringify(usuario));
        }
    });

    console.log(soma)
    console.log(media)
}

function CloseResults() {  //fecha a tabela de resultados
    div_lobby_results.style.display = "none";
}

function zerarVotos() { //admin tem a opção de fazer uma nova votação
    const usuariosAtualizados = userList.map(usuario => {
        if (usuario.isAdmin) {
            return { ...usuario, refreshAdm: true };
        }
        return usuario;
    });

    usuariosAtualizados.forEach(usuario => {
        if (usuario.isAdmin) {
            // Supondo que 'socket' esteja definido em outro lugar
            socket.send(JSON.stringify(usuario));
        }
    });
}

function exibirVotos() { //admin tem a opção de exibir os votos ou nao

    let usuariosAtualizados
    if (exibirVoto == false) {
        usuariosAtualizados = userList.map(usuario => {
            if (usuario.isAdmin) {
                return { ...usuario, exibir: true };
            }
            return usuario;
        });
        exibirVoto = true;
    } else {
        usuariosAtualizados = userList.map(usuario => {
            if (usuario.isAdmin) {
                return { ...usuario, exibir: false };
            }
            return usuario;
        });
        exibirVoto = false;
    }


    usuariosAtualizados.forEach(usuario => {
        if (usuario.isAdmin) {
            // Supondo que 'socket' esteja definido em outro lugar
            socket.send(JSON.stringify(usuario));
        }
    });
}

socket.addEventListener('close', (event) => { // Evento 'close' do WebSocket:
    console.log('Conexão fechada');
});
