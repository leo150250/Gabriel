var dialogMenuInstrumentos = null;
var dialogSelecionarInstrumentos = null;

var dialogoInstrumentos = null;
var dialogoSelecionarInstrumentos = null;
var jsonInstrumentos = [];
var tableListaInstrumentos = null;
var tableListaPautas = null;
var numInstrumento = 0;
var instrumentoSelecionado = null;

var divInstrumentosListagemCategorias = null;
var divInstrumentosListagem = null;
var categoriaSelecionada = null;
var listagemInstrumentos = [];
var inputBuscaInstrumento = null;

var inputInstrumentoNome = null;
var inputInstrumentoAbreviatura = null;
var inputInstrumentoTipoNotacao = null;
var inputInstrumentoTransposicao = null;

class PautaListagem {
	constructor(argInstrumento,argClave) {
		this.instrumento = argInstrumento;
		this.clave = argClave;
		this.el = document.createElement("tr");
		this.ordem = argInstrumento.pautas.length;

		this.el_nome = document.createElement("td");
		this.atualizarIdentificacao();
		this.el.appendChild(this.el_nome);

		this.el_clave = document.createElement("td");
		this.el_clave.innerHTML = argClave;
		this.el.appendChild(this.el_clave);

		this.el_solo = document.createElement("td");
		this.el_solo.style.textAlign = "center";
		this.el_inputSolo = document.createElement("input");
		this.el_inputSolo.type = "checkbox";
		this.el_inputSolo.onchange = (e)=>{
			this.instrumento.alterarSolo();
		}
		this.el_solo.appendChild(this.el_inputSolo);
		this.el.appendChild(this.el_solo);

		this.el_mudo = document.createElement("td");
		this.el_mudo.style.textAlign = "center";
		this.el_inputMudo = document.createElement("input");
		this.el_inputMudo.type = "checkbox";
		this.el_inputMudo.onchange = (e)=>{
			this.instrumento.alterarMudo();
		}
		this.el_mudo.appendChild(this.el_inputMudo);
		this.el.appendChild(this.el_mudo);
	}
	atualizarIdentificacao() {
		this.el_nome.innerHTML = "Pauta " + (this.instrumento.ordem + 1) + "." + (this.ordem + 1);
	}
}
class InstrumentoListagem {
	constructor(argNome,argAbreviatura,argReferencia = null,argPautas = [],argNotacao = "comum",argTransposicao = 0) {
		this.nome = argNome;
		this.abreviatura = argAbreviatura;
		this.referencia = argReferencia;
		this.ordem = listagemInstrumentos.length;
		this.pautas = [];
		argPautas.forEach(pauta=>{
			this.pautas.push(new PautaListagem(this,pauta));
		});
		this.notacao = argNotacao; //[TODO] Classe de notações
		if (this.referencia != null) {
			this.transposicao = this.referencia.transposicao;
		} else {
			this.transposicao = argTransposicao;
		}
	
		this.el = document.createElement("tr");
		this.el.onclick = (e)=>{
			exibirInstrumentoListagem(this);
		}
		this.el.draggable = true;
		this.el.style.cursor = "grab";
		this.el.ondragstart = (e)=>{
			e.dataTransfer.setData("integer",this.ordem);
			this.el.style.cursor = "grabbing";
		}
		this.el.ondragend = (e)=>{
			this.el.style.cursor = "grab";
		}
		
		this.el_ordem = document.createElement("td");
		this.el_ordem.innerHTML = "⋮ " + (this.ordem + 1);
		this.el.appendChild(this.el_ordem);
		
		this.el_nome = document.createElement("td");
		this.el_nome.innerHTML += this.nome;
		this.el.appendChild(this.el_nome);

		this.el_solo = document.createElement("td");
		this.el_solo.style.textAlign = "center";
		this.el_inputSolo = document.createElement("input");
		this.el_inputSolo.type = "checkbox";
		this.el_inputSolo.title = "Solo";
		this.el_inputSolo.onchange = (e)=>{
			this.alterarSolo(this.el_inputSolo.checked);
		};
		this.el_solo.appendChild(this.el_inputSolo);
		this.el.appendChild(this.el_solo);

		this.el_mudo = document.createElement("td");
		this.el_mudo.style.textAlign = "center";
		this.el_inputMudo = document.createElement("input");
		this.el_inputMudo.type = "checkbox";
		this.el_inputMudo.onchange = (e)=>{
			this.alterarMudo(this.el_inputMudo.checked);
		};
		this.el_mudo.appendChild(this.el_inputMudo);
		this.el.appendChild(this.el_mudo);
		
		
		this.el_dragAntes = document.createElement("tr");
		this.el_dragAntes.classList.add("dragOver");
		this.el_dragAntes.innerHTML="<hr>";
		this.el_dragAntes.ondrop = (e)=>{
			//console.log("ANTES");
			e.preventDefault();
			let dados = e.dataTransfer.getData("integer");
			//Realocar o índice de listagemInstrumentos armazenado do drop para o índice onde está esta classe, e reordena os demais itens da array listagemInstrumentos
			let indice = parseInt(dados);
			let indiceDestino = this.ordem;
			if (indice < indiceDestino) {
				indiceDestino--;
			}
			let item = listagemInstrumentos[indice];
			listagemInstrumentos.splice(indice,1);
			//Imprime no console o nome de cada instrumento em listagemInstrumentos em uma única linha, separados por vírgula
			//console.log(listagemInstrumentos.map(item=>item.nome).join(", "));
			//Insere o item no novo
			listagemInstrumentos.splice(indiceDestino,0,item);
			//console.log(listagemInstrumentos.map(item=>item.nome).join(", "));
			listagemInstrumentos.forEach((item,indice)=>{
				item.ordem = indice;
				item.el_ordem.innerHTML = "⋮ " + (item.ordem + 1);
				item.pautas.forEach(pauta=>{
					pauta.atualizarIdentificacao();
				});
			});
			listagemInstrumentos[indiceDestino].el_nome.innerHTML = "* " + listagemInstrumentos[indiceDestino].nome;
			//Reordena os children da tableListaInstrumentos de acordo com a nova ordem
			let headerTabelaInstrumentos = tableListaInstrumentos.childNodes[0];
			while (tableListaInstrumentos.firstChild) {
				tableListaInstrumentos.removeChild(tableListaInstrumentos.firstChild);
			}
			tableListaInstrumentos.appendChild(headerTabelaInstrumentos);
			listagemInstrumentos.forEach(item=>{
				tableListaInstrumentos.appendChild(item.el_dragAntes);
				tableListaInstrumentos.appendChild(item.el);
				tableListaInstrumentos.appendChild(item.el_dragDepois);
			});
			this.el_dragAntes.classList.remove("onDrag");
		}
		this.el_dragAntes.ondragover = (e)=>{
			e.preventDefault();
			this.el_dragAntes.classList.add("onDrag");
		}
		this.el_dragAntes.ondragleave = (e)=>{
			this.el_dragAntes.classList.remove("onDrag");
		}

		this.el_dragDepois = document.createElement("tr");
		this.el_dragDepois.classList.add("dragOver");
		this.el_dragDepois.innerHTML="<hr>";
		this.el_dragDepois.ondrop = (e)=>{
			//console.log("DEPOIS");
			e.preventDefault();
			let dados = e.dataTransfer.getData("integer");
			//Realocar o índice de listagemInstrumentos armazenado do drop para o índice onde está esta classe, e reordena os demais itens da array listagemInstrumentos
			let indice = parseInt(dados);
			let indiceDestino = this.ordem;
			if (indice < indiceDestino) {
				indiceDestino--;
			}
			let item = listagemInstrumentos[indice];
			listagemInstrumentos.splice(indice,1);
			listagemInstrumentos.splice(indiceDestino,0,item);
			listagemInstrumentos.forEach((item,indice)=>{
				item.ordem = indice;
				item.el_ordem.innerHTML = "⋮ " + (item.ordem + 1);
				item.pautas.forEach(pauta=>{
					pauta.atualizarIdentificacao();
				});
			});
			listagemInstrumentos[indiceDestino].el_nome.innerHTML = "* " + listagemInstrumentos[indiceDestino].nome;
			//Reordena os children da tableListaInstrumentos de acordo com a nova ordem
			let headerTabelaInstrumentos = tableListaInstrumentos.childNodes[0];
			while (tableListaInstrumentos.firstChild) {
				tableListaInstrumentos.removeChild(tableListaInstrumentos.firstChild);
			}
			tableListaInstrumentos.appendChild(headerTabelaInstrumentos);
			listagemInstrumentos.forEach(item=>{
				tableListaInstrumentos.appendChild(item.el_dragAntes);
				tableListaInstrumentos.appendChild(item.el);
				tableListaInstrumentos.appendChild(item.el_dragDepois);
			});
			this.el_dragDepois.classList.remove("onDrag");
			this.el_nome.innerHTML = "* " + this.nome;
		}
		this.el_dragDepois.ondragover = (e)=>{
			e.preventDefault();
			this.el_dragDepois.classList.add("onDrag");
		}
		this.el_dragDepois.ondragleave = (e)=>{
			this.el_dragDepois.classList.remove("onDrag");
		}

		tableListaInstrumentos.appendChild(this.el_dragAntes);
		tableListaInstrumentos.appendChild(this.el);
		tableListaInstrumentos.appendChild(this.el_dragDepois);
		listagemInstrumentos.push(this);
	}
	selecionar() {
		this.el.classList.add("selecionado");
		//Atualiza os campos do formulário para os valores do instrumento selecionado, e habilita os campos para edição
		atualizarCamposFormulario(this);
	}
	desselecionar() {
		this.el.classList.remove("selecionado");
		let headerTabelaPautas = tableListaPautas.childNodes[0];
		while (tableListaPautas.firstChild) {
			tableListaPautas.removeChild(tableListaPautas.firstChild);
		}
		tableListaPautas.appendChild(headerTabelaPautas);
	}
	alterarSolo(argDefinicao = null) {
		if (argDefinicao == null) {
			let numInputs = 0;
			this.pautas.forEach(pauta => {
				if (pauta.el_inputSolo.checked) { numInputs++ };
			});
			if (numInputs == 0) {
				this.alterarSolo(false);
			} else if (numInputs == this.pautas.length) {
				this.alterarSolo(true);
			} else {
				this.el_inputSolo.indeterminate = true;
			}
		} else {
			this.el_inputSolo.indeterminate = false;
			this.el_inputSolo.checked = argDefinicao;
			this.pautas.forEach(pauta => {
				pauta.el_inputSolo.checked = argDefinicao;
			});
		}
	}
	alterarMudo(argDefinicao = null) {
		if (argDefinicao == null) {
			let numInputs = 0;
			this.pautas.forEach(pauta => {
				if (pauta.el_inputMudo.checked) { numInputs++ };
			});
			if (numInputs == 0) {
				this.alterarMudo(false);
			} else if (numInputs == this.pautas.length) {
				this.alterarMudo(true);
			} else {
				this.el_inputMudo.indeterminate = true;
			}
		} else {
			this.el_inputMudo.indeterminate = false;
			this.el_inputMudo.checked = argDefinicao;
			this.pautas.forEach(pauta => {
				pauta.el_inputMudo.checked = argDefinicao;
			});
		}
	}
}

async function carregarModulo_instrumentos() {
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
	tableListaPautas = document.getElementById("listaPautas");

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
	divMenuTopo.appendChild(dialogoInstrumentos.botao);

	inputInstrumentoNome = document.getElementById("dialogInstrumentos_nomeInstrumento");
	inputInstrumentoAbreviatura = document.getElementById("dialogInstrumentos_abreviaturaInstrumento");
	inputInstrumentoTipoNotacao = document.getElementById("dialogInstrumentos_tipoNotacaoInstrumento");
	inputInstrumentoTransposicao = document.getElementById("dialogInstrumentos_transposicaoInstrumento");

	inputBuscaInstrumento = document.getElementById("inputBuscaInstrumento");

	atualizarLoading(-1);
	//dialogoInstrumentos.selecionar();
	//dialogoSelecionarInstrumentos.selecionar();
	return true;
}

function exibirInstrumentoListagem(argInstrumento) {
	if (instrumentoSelecionado!=null) {
		instrumentoSelecionado.desselecionar();
	}
	instrumentoSelecionado = argInstrumento;
	if (instrumentoSelecionado!=null) {
		instrumentoSelecionado.selecionar();
	}
}
function obterListaInstrumentos() {
	listagemInstrumentos = [];
	inputInstrumentoNome.disabled = true;
	inputInstrumentoAbreviatura.disabled = true;
	inputInstrumentoTipoNotacao.disabled = true;
	inputInstrumentoTransposicao.disabled = true;
	inputInstrumentoNome.value = "";
	inputInstrumentoAbreviatura.value = "";
	inputInstrumentoTipoNotacao.value = "";
	inputInstrumentoTransposicao.value = "";
	let headerTabelaInstrumentos = tableListaInstrumentos.getElementsByTagName("tr")[0];
	//Obtem o primeiro elemento tr da tabela tableListaInstrumentos
	while (tableListaInstrumentos.firstChild) {
		tableListaInstrumentos.removeChild(tableListaInstrumentos.firstChild);
	}
	tableListaInstrumentos.appendChild(headerTabelaInstrumentos);

	let headerTabelaPautas = tableListaPautas.getElementsByTagName("tr")[0];
	while (tableListaPautas.firstChild) {
		tableListaPautas.removeChild(tableListaPautas.firstChild);
	}
	tableListaPautas.appendChild(headerTabelaPautas);
	numInstrumento = 0;
	instrumentos.forEach(instrumento => {
		//gerarInstrumentoListagem(instrumento);
		new InstrumentoListagem(instrumento.nome,instrumento.abreviatura,instrumento,instrumento.obterListagemPautas());
	});
	//console.log(listagemInstrumentos);
}
function atualizarCamposFormulario(argInstrumentoListagem) {
	inputInstrumentoNome.value = argInstrumentoListagem.nome;
	inputInstrumentoAbreviatura.value = argInstrumentoListagem.abreviatura;
	inputInstrumentoTipoNotacao.value = argInstrumentoListagem.notacao;
	inputInstrumentoTransposicao.value = argInstrumentoListagem.transposicao;

	inputInstrumentoNome.disabled = false;
	inputInstrumentoAbreviatura.disabled = false;
	inputInstrumentoTipoNotacao.disabled = false;
	inputInstrumentoTransposicao.disabled = false;

	argInstrumentoListagem.pautas.forEach(pauta => {
		tableListaPautas.appendChild(pauta.el);
	});
}
function modificarInstrumentoSelecionado() {
	instrumentoSelecionado.nome = inputInstrumentoNome.value;
	instrumentoSelecionado.abreviatura = inputInstrumentoAbreviatura.value;
	instrumentoSelecionado.notacao = inputInstrumentoTipoNotacao.value;
	instrumentoSelecionado.transposicao = inputInstrumentoTransposicao.value;

	instrumentoSelecionado.el_nome.innerHTML = "* " + instrumentoSelecionado.nome;
}

function aplicarAlteracoesListagem() {
	//Cria uma nova array de instrumentos:
	let instrumentosAtualizacao=[];
	//Varre listagemInstrumentos possui referencia que não seja nula
	for (let i = 0; i < listagemInstrumentos.length; i++) {
		if (listagemInstrumentos[i].referencia!=null) {
			//Reseta o instrumentoAnterior e instrumentoPosterior da referência:
			listagemInstrumentos[i].referencia.instrumentoAnterior = null;
			listagemInstrumentos[i].referencia.instrumentoPosterior = null;
			listagemInstrumentos[i].referencia.nome = listagemInstrumentos[i].nome;
			listagemInstrumentos[i].referencia.abreviatura = listagemInstrumentos[i].abreviatura;
			listagemInstrumentos[i].referencia.notacao = listagemInstrumentos[i].notacao;
			listagemInstrumentos[i].referencia.transposicao = listagemInstrumentos[i].transposicao;

			instrumentosAtualizacao.push(listagemInstrumentos[i].referencia);
		} else {
			//Gera uma array com as claves das pautas
			let pautas = [];
			listagemInstrumentos[i].pautas.forEach(pauta=>{
				pautas.push(pauta.clave);
			});
			//Cria um novo instrumento com as informações que estão no objeto:
			let novoInstrumento = new Instrumento(listagemInstrumentos[i].nome,listagemInstrumentos[i].abreviatura,pautas,null,listagemInstrumentos[i].notacao,listagemInstrumentos[i].transposicao);
			//Adiciona o novo instrumento à array de instrumentos
			instrumentosAtualizacao.push(novoInstrumento);
		}
	}
	//Atualiza as variáveis instrumentoAnterior e instrumentoPosterior de acordo com os instrumentos de instrumentosAtualizacao:
	for (let i = 0; i < instrumentosAtualizacao.length; i++) {
		if (i>0) {
			instrumentosAtualizacao[i].instrumentoAnterior = instrumentosAtualizacao[i-1];
		}
		if (i<instrumentosAtualizacao.length-1) {
			instrumentosAtualizacao[i].instrumentoPosterior = instrumentosAtualizacao[i+1];
		}
	}
	//Substitui a array de instrumentos pela nova array:
	instrumentos = instrumentosAtualizacao;
	//Fecha o diálogo de instrumentos:
	dialogoInstrumentos.desselecionar();
	//Renderiza a partitura novamente:
	renderizarPartitura();
}


//#region Inserção de novos instrumentos
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
		//let novaLinhaGerada = gerarInstrumentoListagem(argInstrumento,"adicionar");
		let novoInstrumentoGerado = new InstrumentoListagem(argInstrumento.nome,argInstrumento.abreviatura,null,argInstrumento.pautas,"comum",argInstrumento.transposicao);
		novoInstrumentoGerado.el.scrollIntoView({
			behavior: "smooth",
			block: "center",
			inline: "center"
		});
		dialogoSelecionarInstrumentos.desselecionar();
		exibirInstrumentoListagem(novoInstrumentoGerado);
	}
	divInstrumentosListagem.appendChild(novoBotaoInstrumento);
}
function buscarInstrumentos() {
	while (divInstrumentosListagem.firstChild) {
		divInstrumentosListagem.removeChild(divInstrumentosListagem.firstChild);
	}
	jsonInstrumentos.forEach(instrumento => {
		if (instrumento.nome.toLowerCase().includes(inputBuscaInstrumento.value.toLowerCase())) {
			gerarBotaoInstrumento(instrumento);
		}
	});
}
//#endregion

carregarModulo_instrumentos();