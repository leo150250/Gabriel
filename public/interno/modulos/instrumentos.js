var dialogMenuInstrumentos = null;
var dialogSelecionarInstrumentos = null;

var dialogoInstrumentos = null;
var dialogoSelecionarInstrumentos = null;
var jsonInstrumentos = [];
var tableListaInstrumentos = null;

async function carregarModulo() {
	atualizarLoading(1);
	let nomeModulo = "Instrumentos";
	let botaoModulo = "🎹";
	//console.log(Gabriel);
	let jsonModulo = await carregarPagina("./interno/modulos/instrumentos.json");
	jsonInstrumentos = JSON.parse(jsonModulo);
	//console.log(jsonInstrumentos);
	let parser = new DOMParser();
	let paginaModulo = await carregarPagina("./interno/modulos/instrumentos.html");
	let conteudoDialogo = parser.parseFromString(paginaModulo,"text/html");
	let paginaSelecionarInstrumentos = await carregarPagina("./interno/modulos/instrumentos_selecionar.html");
	let conteudoSelecionarInstrumentos = parser.parseFromString(paginaSelecionarInstrumentos,"text/html");
	//let novoEstilo = document.createElement("link");
	//novoEstilo.rel = "stylesheet";
	//novoEstilo.href = "interno/modulos/editor.css";
	//novoEstilo.type = "text/css";
	//document.head.appendChild(novoEstilo);
	//divMenuEdicao = conteudoModulo.childNodes[0].childNodes[1].childNodes[0];
	//console.log(conteudoDialogo.childNodes[0].childNodes[1].childNodes[0]);
	dialogMenuInstrumentos = conteudoDialogo.childNodes[0].childNodes[1].childNodes[0];
	dialogSelecionarInstrumentos = conteudoSelecionarInstrumentos.childNodes[0].childNodes[1].childNodes[0];
	//dialogMenuInstrumentos = document.createElement("dialog");
	dialogoInstrumentos = new Dialogo(nomeModulo,botaoModulo,dialogMenuInstrumentos,obterListaInstrumentos);
	dialogoSelecionarInstrumentos = new Dialogo("Selecionar instrumentos",null,dialogSelecionarInstrumentos);
	//divPartitura.appendChild(divEditor);
	tableListaInstrumentos = document.getElementById("listaInstrumentos");
	atualizarLoading(-1);
	dialogoInstrumentos.selecionar();
	dialogoSelecionarInstrumentos.selecionar();
	return true;
}

function obterListaInstrumentos() {
	let headerTabela = tableListaInstrumentos.childNodes[1].childNodes[0];
	while (tableListaInstrumentos.firstChild) {
		tableListaInstrumentos.removeChild(tableListaInstrumentos.firstChild);
	}
	tableListaInstrumentos.appendChild(headerTabela);
	let numInstrumento = 0;
	instrumentos.forEach(instrumento => {
		let novaLinha;
		let novoCampo;
		novaLinha = document.createElement("tr");
		novoCampo = document.createElement("td");
		numInstrumento++;
		novoCampo.innerHTML = "⋮ " + numInstrumento;
		let novoBotao = document.createElement("button");
		novoBotao.innerHTML = "▸";
		let pautasAbertas = false;
		let pautasParaAbrir =[];
		novoBotao.onclick=(e)=>{
			pautasAbertas=!pautasAbertas;
			if (pautasAbertas) {
				novoBotao.innerHTML = "▾";
				novoBotao.classList.add("selecionado");
				pautasParaAbrir.forEach(pauta => {
					pauta.style.display=null;
				});
			} else {
				novoBotao.innerHTML = "▸";
				novoBotao.classList.remove("selecionado");
				pautasParaAbrir.forEach(pauta => {
					pauta.style.display="none";
				});
			}
		}
		novoCampo.appendChild(novoBotao);
		novaLinha.draggable = true;
		novaLinha.appendChild(novoCampo);
		//Marcação solo
		novoCampo = document.createElement("td");
		novoCampo.innerHTML = instrumento.nome;
		novaLinha.appendChild(novoCampo);
		novoCampo = document.createElement("td");
		novoCampo.style.textAlign = "center";
		let novoInputSoloPrincipal = document.createElement("input");
		novoInputSoloPrincipal.type = "checkbox";
		novoInputSoloPrincipal.title = "Solo";
		novoCampo.appendChild(novoInputSoloPrincipal);
		novaLinha.appendChild(novoCampo);
		let inputsSolos = [];
		novoInputSoloPrincipal.onchange = (e)=>{
			inputsSolos.forEach(inputSolo => {
				inputSolo.checked = novoInputSoloPrincipal.checked;
			});
		};
		//Marcação mudo
		novoCampo = document.createElement("td");
		novoCampo.style.textAlign = "center";
		let novoInputMudoPrincipal = document.createElement("input");
		novoInputMudoPrincipal.type = "checkbox";
		novoCampo.appendChild(novoInputMudoPrincipal);
		novaLinha.appendChild(novoCampo);
		let inputsMudos = [];
		novoInputMudoPrincipal.onchange = (e)=>{
			inputsMudos.forEach(inputMudo => {
				inputMudo.checked = novoInputMudoPrincipal.checked;
			});
		};
		tableListaInstrumentos.appendChild(novaLinha);
		let numPauta = 0;
		instrumento.pautas.forEach(pauta => {
			novaLinha = document.createElement("tr");
			novoCampo = document.createElement("td");
			novaLinha.appendChild(novoCampo);
			novoCampo = document.createElement("td");
			numPauta++;
			novoCampo.innerHTML = "Pauta " + numInstrumento + "." + numPauta;
			novaLinha.appendChild(novoCampo);
			novoCampo = document.createElement("td");
			novoCampo.style.textAlign = "center";
			let novoInputSolo = document.createElement("input");
			novoInputSolo.type = "checkbox";
			inputsSolos.push(novoInputSolo);
			novoInputSolo.onchange = (e)=>{
				let numInputs = 0;
				inputsSolos.forEach(inputSolo => {
					if (inputSolo.checked) { numInputs++ };
				});
				if (numInputs == 0) {
					novoInputSoloPrincipal.checked = false;
					novoInputSoloPrincipal.indeterminate = false;
				} else if (numInputs == inputsSolos.length) {
					novoInputSoloPrincipal.checked = true;
					novoInputSoloPrincipal.indeterminate = false;
				} else {
					novoInputSoloPrincipal.indeterminate = true;
				}
			}
			novoCampo.appendChild(novoInputSolo);
			novaLinha.appendChild(novoCampo);
			novoCampo = document.createElement("td");
			novoCampo.style.textAlign = "center";
			let novoInputMudo = document.createElement("input");
			novoInputMudo.type = "checkbox";
			inputsMudos.push(novoInputMudo);
			novoInputMudo.onchange = (e)=>{
				let numInputs = 0;
				inputsMudos.forEach(inputMudo => {
					if (inputMudo.checked) { numInputs++ };
				});
				if (numInputs == 0) {
					novoInputMudoPrincipal.checked = false;
					novoInputMudoPrincipal.indeterminate = false;
				} else if (numInputs == inputsMudos.length) {
					novoInputMudoPrincipal.checked = true;
					novoInputMudoPrincipal.indeterminate = false;
				} else {
					novoInputMudoPrincipal.indeterminate = true;
				}
			}
			novoCampo.appendChild(novoInputMudo);
			novaLinha.appendChild(novoCampo);
			pautasParaAbrir.push(novaLinha);
			novaLinha.style.display="none";
			tableListaInstrumentos.appendChild(novaLinha);
		})
	});
}
carregarModulo();