//lobby elements
var containerPlayer = document.querySelector("#div-players");
var div_lobby = document.querySelector("#div-lobby");

//botao do login
var botaoLogin = document.querySelector("#buttonSend-login");
var minhaSection = document.querySelector("#section-login");
var input_login = document.querySelector("#LoginNome");


const currentDate = new Date();
const user = { id: "", name: "", votou: false, idxuser: null, isAdmin: false }
let userList = [];

let idUsuario
let votouUsuario = false

const socket = new WebSocket('ws://localhost:3000');

socket.addEventListener('open', (event) => {
    console.log('Conectado ao servidor WebSocket');
    // Enviar informações do usuário para o servidor

    if (user.name != "") {
        socket.send(JSON.stringify(user));
    }
});

botaoLogin.addEventListener("click", function () { // Adiciona um ouvinte de evento de clique ao botão de login

    if (input_login.value != "") {

        user.name = input_login.value
        user.id = currentDate.getMilliseconds();
        idUsuario = user.id

        socket.send(JSON.stringify(user));  // Agora, o evento open será acionado antes dessa linha

        minhaSection.style.display = "none"
        div_lobby.style.display = "flex"

    }
    else {
        alert("preencha o campo")
    }
});

function montarUsersOnline(userList) {
    containerPlayer.innerHTML = ``;
    userList.forEach(x => {
        containerPlayer.innerHTML += `
            <p class="user-lobby-ativo">
                ${x.isAdmin ? `<i class="ph ph-user-circle-gear"></i>` : `<i class="ph ph-user"></i>`}
                ${x.name} 
                ${x.votou ? `  <i class="ph ph-check-circle"></i>` : ``}</p>
            <br>
        `;
    })
}


socket.addEventListener('message', (event) => {
    userList = JSON.parse(event.data);

    console.log('tamanho:', userList.length, 'Lista de usuários conectados:', userList);

    if (userList[0].isAdmin == false) {
        userList[0].isAdmin = true;
    }

    // Atualize a interface do usuário com a lista de usuários
    // Exemplo: renderizar a lista em uma div ou outra parte da página
    // ...

    montarUsersOnline(userList)

    // Aqui você pode notificar o usuário sobre a entrada ou saída de outros usuários
    // Exemplo: mostrar uma notificação
    // ...
});

socket.addEventListener('close', (event) => {
    console.log('Conexão fechada');
});

/**
 * param {MouseEvent} event
*/

function magianegra(event) {
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
}
//socket.dispatchEvent(new Event("message"))



