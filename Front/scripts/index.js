var containerStories = document.querySelector(".sidebar-stories-geral")
var panelCreateStories = document.querySelector(".panel-add-stories");

//lobby elements
var containerPlayer = document.querySelector("#div-players");
var div_lobby = document.querySelector("#div-lobby");
var div_lobby_results = document.querySelector(".lobby_votacao");

//botao do login
var botaoLogin = document.querySelector("#buttonSend-login");
var minhaSection = document.querySelector("#section-login");
var input_login = document.querySelector("#LoginNome");
var input_Id_login = document.querySelector("#loginSenha");

//elemento do icon
var eyeIcon = document.getElementById('eyeIcon');

//elementos do user-informations da sidebar
var h2UserInformation = document.getElementById("sidebar-user-informations-user-name");
let inviteToken = document.querySelector('.invite-token h2');

//
var containerBotao = document.getElementById("planning-poker-lobby-sidebar-adminButton");

//container dos resultados
var containerResults = document.getElementById("lobby_votacao");

const currentDate = new Date();
let userList = [];
let sectionsList = [];

const user = {
    sectionId: "",
    sectionName: "",
    id: "",
    name: "",
    isAdmin: false,
    sectionId: "",
    votou: false,
    idxuser: null,
    refreshAdm: false,
    exibir: false,
}

let room = {
    sectionName: "",
    sectionId: "",
    CreatedAt: "",
    stories: []
}

var soma = 0;
let exibirVoto
let idUsuario
let nameUsuario
let votouUsuario = false
let adm = false
var media = 0
var abrirContabilizador = false
var idSecao = null;
var createSection = false;
var validouEntrada = false;
var nameSectionValidation;

const socket = new WebSocket('ws://localhost:3000');

socket.addEventListener('open', (event) => {    // Evento 'open' do WebSocker e envia o user
    console.log('Conectado ao servidor WebSocket');
    // Enviar informações do usuário para o servidor

    if (user.name != "") {
        socket.send(JSON.stringify(user));
    }
});

function sendLogin() { // Adiciona um ouvinte de evento de clique ao botão de login
    if (input_login.value != "" || input_Id_login.value != "") {
        //para o server
        user.name = input_login.value
        user.id = generateId("user");

        //para manipulação no index
        idUsuario = user.id
        nameUsuario = user.name
        idSecao = input_Id_login.value
        h2UserInformation.innerText = nameUsuario;

        user.sectionId = idSecao;
        socket.send(JSON.stringify(user));
    }
    else {
        alert("preencha o campo")
    }
};

function validandoEntradaUsuario() {
    userList.forEach(x => {
        if (x.sectionId === input_Id_login.value) {
            nameSectionValidation = x.sectionName;
        }
    });

    minhaSection.style.display = "none"
    div_lobby.style.display = "flex"
}

function montandoContabilizador() {  // resultado da votação votação
    if (userList.contador == true) {
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
        inviteToken.innerText = x.sectionId
    })
}

function adminConfigurations() { //algumas configurações e funcionalidades do Admin
    var containerBotao = document.getElementById("planning-poker-lobby-sidebar-adminButton");
    containerBotao.innerHTML = `<button type="button" title="Contabilizar Votos" id="cardEncerrar" onclick="contabilizandoVotos()" class="btn-lobby-Encerrar"><strong><i class="ph ph-arrow-square-out"></i></strong></button>
                                    <button type="button" title="Exibir votos" id="eyeIcon" onclick="exibirVotos()" class="btn-lobby-Encerrar"><strong><i class="ph ph-eye-slash"></i></strong></button>
                                    <button type="button" title="Nova Votação" id="refrechIcon" onclick="zerarVotos()" class="btn-lobby-Encerrar"><strong><i class="ph ph-arrows-counter-clockwise"></i></strong></button>
                                `;
    var openPanelStories = document.querySelector(".open-panel-add-stories");
    openPanelStories.innerHTML = `
                <div class="divisor-stories"></div>
                <div class="boiolon">
                    <button type="button" onclick="createStories()" class="btn-lobby-addStories">
                        <strong><i class="ph ph-plus"><br></i></strong>
                    </button>
                </div>
            `;
}

socket.addEventListener('message', (event) => { //retorna a lista de usuarios do servidor
    userList = JSON.parse(event.data);
    console.log('tamanho:', userList.length, 'Lista de usuários conectados:', userList);

    sectionsList = userList.filter((section) => {
        return section.isAdmin;
    }).map((section) => {
        return { sectionId: section.sectionId, sectionName: section.sectionName, nameUsuario: section.nameUsuario };
    });

    if (validouEntrada == false && createSection == false) {
        if (sectionsList.some((section) => section.sectionId == input_Id_login.value)) {
            validandoEntradaUsuario()
        } else {
            window.alert("id de sessão não encontrado")
            //window.location.reload();
        }
        validouEntrada = true;
    }

    if (createSection == true) {
        adminConfigurations();
    } else {
        panelCreateStories.style.display = "none";
    }

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


////////////////////////////////////////////////////////////////////////
/////////////FUNÇOES DA TELA INICIAL
////////////////////////////////////////////////////////////////////////
var createRoomForm = document.querySelector(".div-create-room")

var adminName = document.querySelector(".userName")
var roomName = document.querySelector(".roomName")

var bct = document.querySelector(".div-geral")

function joinRoom() {
    bct.style.display = "none"
    minhaSection.style.display = "flex"
}

function closePanelCreateRoom() {
    createRoomForm.style.display = "none";
}
function panelCreateRoom() {
    createRoomForm.style.display = "flex";
}

function handleCreateRoom() {
    if (adminName.value == "" || roomName.value == "") return alert("preencha o campo");
    adm = true;

    const { room } = createRoom();
    createSection = true

    const { user } = createUser();
    idUsuario = idUsuario = user.id

    socket.send(JSON.stringify(user));

    createRoomForm.style.display = "none";
    bct.style.display = "none"
    div_lobby.style.display = "flex"
}

var idRoom = generateId("room");
function createRoom() {
    room = {
        sectionName: roomName.value,
        sectionId: idRoom,
        CreatedAt: new Date(),
        stories: [],
    }
    return { room }

}

function createUser(adm) {
    const user = {
        id: generateId("user"),
        name: adminName.value,
        isAdmin: false,
        sectionId: idRoom,
        sectionName: roomName.value,
        votou: false,
        idxuser: null,
        refreshAdm: false,
        exibir: false,
    }
    if (!adm) user.isAdmin = true
    return { user }

}

function generateId(param) {
    return param + Math.random().toString(36).substr(2, 9);
}


//////////////
function createStories() {
    panelCreateStories.style.display = "flex";
}

function closePanelAddStories() {
    panelCreateStories.style.display = "none";
}

function insertStories() {
    ///agr se fode com o socket otario hahahahahahhahahahah
    //content-views-stories
    var viewStories = document.querySelector(".content-views-stories");
    var inputStories = document.querySelector(".input-insert-stories").value; // Atribui o valor do input

    let newStory = {
        Title: inputStories,
        storiesId: generateId("stories"),
        sectionId: room.sectionId,
        Voted: false,
        Time: "",
        CreatedAt: "",
        AvgPoints: "",
        TotalPoints: ""
    };

    room.stories.push(newStory);
    escrevendoStories()

    console.log(room);
}
var viewStories = document.querySelector(".content-views-stories");

function removeStorie(idDoStory) {
    room.stories = room.stories.filter(story => story.storiesId !== idDoStory);
    console.log(room);
    escrevendoStories()
}

function escrevendoStories(){
    viewStories.innerHTML = ``;
    room.stories.forEach(storie => {
        viewStories.innerHTML += '<h2>' + storie.Title + `</h2><i class="ph ph-trash" onclick="removeStorie('${storie.storiesId}')"></i>`;
    });
}

