var dialogMenuInstrumentos = null;
var dialogSelecionarInstrumentos = null;

var dialogoInstrumentos = null;
var dialogoSelecionarInstrumentos = null;
var jsonInstrumentos = [];
var tableListaInstrumentos = null;
var numInstrumento = 0;

var divInstrumentosListagemCategorias = null;
var divInstrumentosListagem = null;
var categoriaSelecionada = null;

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
	dialogMenuInstrumentos = conteudoDialogo.childNodes[0].childNodes[1].childNodes[0];
	dialogoInstrumentos = new Dialogo(nomeModulo,botaoModulo,dialogMenuInstrumentos,obterListaInstrumentos);
	tableListaInstrumentos = document.getElementById("listaInstrumentos");

	let paginaSelecionarInstrumentos = await carregarPagina("./interno/modulos/instrumentos_selecionar.html");
	let conteudoSelecionarInstrumentos = parser.parseFromString(paginaSelecionarInstrumentos,"text/html");
	dialogSelecionarInstrumentos = conteudoSelecionarInstrumentos.childNodes[0].childNodes[1].childNodes[0];
	dialogoSelecionarInstrumentos = new Dialogo("Selecionar instrumentos",null,dialogSelecionarInstrumentos,obterListagem);
	divInstrumentosListagemCategorias = document.getElementById("instrumentosListagemCategorias");
	divInstrumentosListagem = document.getElementById("instrumentosListagem");
	
	//let novoEstilo = document.createElement("link");
	//novoEstilo.rel = "stylesheet";
	//novoEstilo.href = "interno/modulos/editor.css";
	//novoEstilo.type = "text/css";
	//document.head.appendChild(novoEstilo);
	//divMenuEdicao = conteudoModulo.childNodes[0].childNodes[1].childNodes[0];
	//console.log(conteudoDialogo.childNodes[0].childNodes[1].childNodes[0]);
	//dialogMenuInstrumentos = document.createElement("dialog");
	//divPartitura.appendChild(divEditor);

	atualizarLoading(-1);
	dialogoInstrumentos.selecionar();
	dialogoSelecionarInstrumentos.selecionar();
	return true;
}

function gerarInstrumentoListagem(argInstrumento) {
	let novaLinha;
	let novoCampo;
	novaLinha = document.createElement("tr");
	let retorno = novaLinha;
	retorno.onclick = (e)=>{
		retorno.classList.add("selecionado");
	}
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
	novoCampo.innerHTML = argInstrumento.nome;
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
	argInstrumento.pautas.forEach(pauta => {
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
	});
	return retorno;
}

function obterListaInstrumentos() {
	let headerTabela = tableListaInstrumentos.childNodes[1].childNodes[0];
	while (tableListaInstrumentos.firstChild) {
		tableListaInstrumentos.removeChild(tableListaInstrumentos.firstChild);
	}
	tableListaInstrumentos.appendChild(headerTabela);
	numInstrumento = 0;
	instrumentos.forEach(instrumento => {
		gerarInstrumentoListagem(instrumento);
	});
}

function obterListagem() {
	//Categorias
	while (divInstrumentosListagemCategorias.firstChild) {
		divInstrumentosListagemCategorias.removeChild(divInstrumentosListagemCategorias.firstChild);
	}
	while (divInstrumentosListagem.firstChild) {
		divInstrumentosListagem.removeChild(divInstrumentosListagem.firstChild);
	}
	let categorias=[];
	jsonInstrumentos.forEach(instrumento => {
		instrumento.categoria.forEach(categoria => {
			if (!categorias.includes(categoria)) {
				categorias.push(categoria);
			}
		})
		gerarBotaoInstrumento(instrumento);
	});
	categorias.sort();
	categorias.forEach(categoria=>{
		let novaCategoria = document.createElement("button");
		novaCategoria.innerHTML = categoria;
		novaCategoria.onclick = (e)=>{
			if (categoriaSelecionada!=null) {
				categoriaSelecionada.classList.remove("selecionado");
			}
			categoriaSelecionada = novaCategoria;
			categoriaSelecionada.classList.add("selecionado");
			while (divInstrumentosListagem.firstChild) {
				divInstrumentosListagem.removeChild(divInstrumentosListagem.firstChild);
			}
			jsonInstrumentos.forEach(instrumento => {
				if (instrumento.categoria.includes(categoria)) {
					gerarBotaoInstrumento(instrumento);
				}
			});
		}
		divInstrumentosListagemCategorias.appendChild(novaCategoria);
	})
}

function gerarBotaoInstrumento(argInstrumento) {
	let novoBotaoInstrumento = document.createElement("button");
	let novaImagem = null;
	if (argInstrumento.imagem!="") {
		if (argInstrumento.imagem.includes(".")) {
			novaImagem = document.createElement("img");
			novaImagem.src = argInstrumento.imagem;
		} else {
			novaImagem = document.createElement("span");
			novaImagem.innerHTML = argInstrumento.imagem;
		}
	} else {
		novaImagem = document.createElement("span");
		novaImagem.innerHTML = "🎵";
	}
	novoBotaoInstrumento.appendChild(novaImagem);
	novoNome = document.createElement("p");
	novoNome.innerHTML = argInstrumento.nome;
	novoBotaoInstrumento.appendChild(novoNome);
	let descricao = "Abreviatura: " + argInstrumento.abreviatura + "\n";
	descricao += "Pautas: ";
	for (let i = 0; i < argInstrumento.pautas.length; i++) {
		descricao += argInstrumento.pautas[i];
		if (i < argInstrumento.pautas.length - 1) {
			descricao += ", ";
		}
	}
	let textoTransposicao = "";
	switch (argInstrumento.transposicao) {
		case 0: textoTransposicao = "C (Dó)"; break;
		case 1: textoTransposicao = "F (Fá)"; break;
		case 2: textoTransposicao = "Bb (Si bemol)"; break;
		case 3: textoTransposicao = "Eb (Mi bemol)"; break;
	}
	descricao += "\nTransposição: " + textoTransposicao + "\n";
	novoBotaoInstrumento.title=descricao;
	novoBotaoInstrumento.onclick = (e)=>{
		let novaLinhaGerada = gerarInstrumentoListagem(argInstrumento);
		novaLinhaGerada.scrollIntoView({
			behavior: "smooth",
			block: "center",
			inline: "center"
		});
		dialogoSelecionarInstrumentos.desselecionar();
	}
	divInstrumentosListagem.appendChild(novoBotaoInstrumento);
}

carregarModulo();