// Função para adicionar a classe 'active-header' ao item do menu correspondente à seção visível na página
function ativarMenuAoScroll() {
    const sections = document.querySelectorAll('section'); // Seleciona todas as seções da página

    window.addEventListener('scroll', function () {
        let current = ''; // Inicializa a variável para armazenar a seção atual

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.pageYOffset >= sectionTop - sectionHeight / 3) {
                current = section.getAttribute('id');
            }
        });

        const menuItems = document.querySelectorAll('.nav-link'); // Seleciona todos os itens do menu
        menuItems.forEach(item => {
            item.classList.remove('active-header'); // Remove a classe de todos os itens do menu
            if (item.getAttribute('href').slice(1) === current) {
                item.classList.add('active-header'); // Adiciona a classe 'active-header' ao item do menu correspondente à seção visível
            }
        });
    });
}

// Chama a função ao carregar a página
window.addEventListener('load', ativarMenuAoScroll);

$(document).ready(function () {
    vitrine.eventos.init();
})



// ocultar a class navbar-collapse ao clicar na section desejada
$(document).ready(function() {
    $('.navbar-nav a').on('click', function(){
        $('.navbar-collapse').collapse('hide');
    });
});



// Deixar a rolagem da página mais suave ao clicar na section desejada
document.addEventListener("DOMContentLoaded", function() {
    document.querySelectorAll('.navbar-collapse a[href^="#"]').forEach(anchor => {
        anchor.addEventListener("click", function(e) {
            e.preventDefault();

            const target = document.querySelector(this.getAttribute("href"));
            if (target) {
                target.scrollIntoView({
                    behavior: "smooth"
                });
            }
        });
    });
});


var vitrine = {};

var MINHA_BAG = [];
var MEU_ENDERECO = null;

var VALOR_BAG = 0;
var VALOR_ENTREGA = 10;

var CELEULAR_EMPRESA = '5565999259264';

vitrine.eventos = {

    init: () => {
        vitrine.metodos.obterItensVitrine();
        vitrine.metodos.carregarBotaoWhatsApp();
    }
}

vitrine.metodos = {

    //obtem a lista de itens da vitrine
    obterItensVitrine: (categoria = 'conjunto', vermais = false)=> {

        var filtro = MENU[categoria];
        console.log(filtro);

        if (!vermais) {
            $("#itensVitrine").html('');
            $("#btnVermais").removeClass('hidden');
        }


        $.each(filtro, (i, e) => {

            let temp = vitrine.templates.item.replace(/\${img}/g, e.img)
            .replace(/\${nome}/g, e.name)
            .replace(/\${preco}/g, e.price.toFixed(2).replace('.',','))
            .replace(/\${id}/g, e.id)

            // botao ver mais
            if (vermais && i >= 8 && i < 12){
                $("#itensVitrine").append(temp)
            }

            // paginação inicial (8 itens)
            if(!vermais && i < 8){
                $("#itensVitrine").append(temp)
            }

        })

        // remove o ativo
        $(".container-menu a").removeClass('active');

        // seta o menu para ativo
        $("#menu-" + categoria).addClass('active')
    },


    // clique do botão ver mais
    verMais: () => {

        var ativo = $(".container-menu a.active").attr('id').split('menu-')[1];
        vitrine.metodos.obterItensVitrine(ativo, true)

        $("#btnVermais").addClass('hidden');
    },


    // diminuir a quantidade de itens da vitrine
    diminunirQuantidade: (id) => {

        let qntdAtual = parseInt($("#qntd-" + id).text());
        
        if (qntdAtual > 0){
            $("#qntd-" + id).text(qntdAtual - 1)
        }

    },

    // aumentar a quantidade de itens da vitrine
    aumentarQuantidade: (id) => {

        let qntdAtual = parseInt($("#qntd-" + id).text());
        $("#qntd-" + id).text(qntdAtual + 1)
    },

    // adiconar a bag o item da vitrine
    adicionarABag: (id) => {

        let qntdAtual = parseInt($("#qntd-" + id).text());

        if (qntdAtual > 0) {

            // obter a categoria ativa
            var categoria = $(".container-menu a.active").attr('id').split('menu-')[1];

            // obter a lista ativa
            let filtro = MENU[categoria];

            // obter o item
            let item = $.grep(filtro, (e, i) => { return  e.id == id });

            if (item.length > 0){

                // validar se já existe esse item na bag
                let existe = $.grep(MINHA_BAG, (elem, index) => { return  elem.id == id });

                // caso já exista o item na bag só altera a qntd
                if (existe.length > 0){

                    let objIndex = MINHA_BAG.findIndex((obj => obj.id == id));
                    MINHA_BAG[objIndex].qntd = MINHA_BAG[objIndex].qntd + qntdAtual;

                }
                // caso não exista o item na bag, adiciona ele
                else {
                    item[0].qntd = qntdAtual;
                    MINHA_BAG.push(item[0])
                }

                vitrine.metodos.mensagem('Item adicionado a sacola!', 'green')
                $("#qntd-" + id).text(0)

                vitrine.metodos.atualizarBadgeTotal();

            }
        }
    },

    // atualiza o badge de totais dos botões "Minha bag"
    atualizarBadgeTotal: () => {

        var total = 0;

        $.each(MINHA_BAG, (i, e) => {
            total += e.qntd
        })

        if (total > 0) {
            $(".botao-bag").removeClass('hidden');
            $(".container-total-bag").removeClass('hidden');
        }
        else {
            $(".botao-bag").addClass('hidden')
            $(".container-total-bag").addClass('hidden');
        }

        $(".badge-total-bag").html(total);

    },


    // abrir a modal sacola
    abrirSacola: (abrir) => {

        if (abrir) {
            $("#modalBag").removeClass('hidden');
            vitrine.metodos.carregarBag();
        }
        else {
            $("#modalBag").addClass('hidden');
        }
    },


    // altera os textos e exibe os botões da etapa
    carregarEtapa: (etapa) => {

        if (etapa == 1) {
            $("#lblTituloEtapa").text('Sua sacola:');
            $("#itensBag").removeClass('hidden');
            $("#LocalEntrega").addClass('hidden');
            $("#resumoBag").addClass('hidden');

            $(".etapa").removeClass('active');
            $(".etapa1").addClass('active');

            $("#btnEtapaPedido").removeClass('hidden');
            $("#btnEtapaEndereco").addClass('hidden');
            $("#btnEtapaResumo").addClass('hidden');
            $("#btnVoltar").addClass('hidden');
        }

        if (etapa == 2) {
            $("#lblTituloEtapa").text('Endereço de entrega:');
            $("#itensBag").addClass('hidden');
            $("#LocalEntrega").removeClass('hidden');
            $("#resumoBag").addClass('hidden');

            $(".etapa").removeClass('active');
            $(".etapa1").addClass('active');
            $(".etapa2").addClass('active');

            $("#btnEtapaPedido").addClass('hidden');
            $("#btnEtapaEndereco").removeClass('hidden');
            $("#btnEtapaResumo").addClass('hidden');
            $("#btnVoltar").removeClass('hidden');
        }

        if (etapa == 3) {
            $("#lblTituloEtapa").text('Resumo do pedido:');
            $("#itensBag").addClass('hidden');
            $("#LocalEntrega").addClass('hidden');
            $("#resumoBag").removeClass('hidden');

            $(".etapa").removeClass('active');
            $(".etapa1").addClass('active');
            $(".etapa2").addClass('active');
            $(".etapa3").addClass('active');

            $("#btnEtapaPedido").addClass('hidden');
            $("#btnEtapaEndereco").addClass('hidden');
            $("#btnEtapaResumo").removeClass('hidden');
            $("#btnVoltar").removeClass('hidden');
        }
    },


    //botão de voltar etapa
    voltarEtapa: () => {

        let etapa = $(".etapa.active").length;
        vitrine.metodos.carregarEtapa(etapa - 1);

    },
    
    
    // carrega a lista de itens da Bag
    carregarBag: () => {

        vitrine.metodos.carregarEtapa(1);

        if (MINHA_BAG.length > 0) {

            $("#itensBag").html('');

            $.each(MINHA_BAG, (i, e) => {

                let temp = vitrine.templates.itemBag.replace(/\${img}/g, e.img)
                .replace(/\${nome}/g, e.name)
                .replace(/\${preco}/g, e.price.toFixed(2).replace('.',','))
                .replace(/\${id}/g, e.id)
                .replace(/\${qntd}/g, e.qntd)

                $("#itensBag").append(temp);


                // último item
                if ((i + 1) == MINHA_BAG.length) {
                    vitrine.metodos.carregarValores();
                }

            })

        }
        else {
            $("#itensBag").html('<p class="bag-vazia"><i class="fa fa-shopping-bag"></i> Sua sacola está vazia.</p>');
            vitrine.metodos.carregarValores();
        }
    },


    // diminui a qntd do iten na Bag
    diminunirQuantidadeBag: (id) => {
        
        let qntdAtual = parseInt($("#qntd-bag-" + id).text());
        
        if (qntdAtual > 1){
            $("#qntd-bag-" + id).text(qntdAtual - 1);
            vitrine.metodos.atualizarBag(id, qntdAtual -1);
        }
        else {
            vitrine.metodos.removerItemABag(id)
        }

    },


    // aumenta a qntd do iten na Bag
    aumentarQuantidadeBag: (id) => {

        let qntdAtual = parseInt($("#qntd-bag-" + id).text());
        $("#qntd-bag-" + id).text(qntdAtual + 1);
        vitrine.metodos.atualizarBag(id, qntdAtual + 1);
    },
    

    // remove itens da Bag
    removerItemABag: (id) => {

        MINHA_BAG = $.grep(MINHA_BAG, (e, i) => { return e.id != id});
        vitrine.metodos.carregarBag();

        // atualiza o botão bag com a qntd atualizada
        vitrine.metodos.atualizarBadgeTotal();
    },

    // atualiza a antd de itens da Bag
    atualizarBag: (id, qntd) => {

        let objIndex = MINHA_BAG.findIndex((obj => obj.id == id));
        MINHA_BAG[objIndex].qntd = qntd;

        // atualiza o botão bag com a qntd atualizada
        vitrine.metodos.atualizarBadgeTotal();

        // atualzia os valores (R$) totais da bag
        vitrine.metodos.carregarValores();
    },

    // carrega os valores de Subtotal, Entrega e Total
    carregarValores: () => {

        VALOR_BAG = 0;

        $("#lblSubtotal").text('R$ 0,00');
        $("#lblValorEntrega").text('+ R$ 0,00');
        $("#lblValorTotal").text('R$ 0,00');

        $.each(MINHA_BAG, (i, e) => {

            VALOR_BAG += parseFloat(e.price * e.qntd);

            if ((i + 1) == MINHA_BAG.length) {
                $("#lblSubtotal").text(`R$ ${VALOR_BAG.toFixed(2).replace('.',',')}`);
                $("#lblValorEntrega").text(`+ R$ ${VALOR_ENTREGA.toFixed(2).replace('.',',')}`);
                $("#lblValorTotal").text(`R$ ${(VALOR_BAG + VALOR_ENTREGA).toFixed(2).replace('.',',')}`);
            }
        })
    },

    // carregar a etapa endereço
    carregarEndereco: () => {

        if (MINHA_BAG.length <= 0) {
            vitrine.metodos.mensagem('Sua sacola está vazia!')
            return;
        }

        vitrine.metodos.carregarEtapa(2);
    },
    

    // API ViaCEP
    buscarCep: () => {

        // cria a variavel com o valor do cep
        var cep = $("#txtCEP").val().trim().replace(/\D/g, '');

        // verifica se o CEP possui valor informado
        if (cep != "") {

            // Expressão regular para validade CEP
            var validacep = /^[0-9]{8}/;

            if (validacep.test(cep)) {

                $.getJSON("https://viacep.com.br/ws/" + cep + "/json/?callback=?", function (dados) {

                    if (!("erro" in dados)) {

                        // atualia os campos com os valores retornados
                        $("#txtEndereco").val(dados.logradouro);
                        $("#txtBairro").val(dados.bairro);
                        $("#txtCidade").val(dados.localidade);
                        $("#ddlUF").val(dados.uf);
                        $("#txtNumero").focus();
                    }
                    else {
                        vitrine.metodos.mensagem('CEP não encontrado. Preencha as informações manualmente.');
                        $("#txtEndereco").focus();
                    }

                })
            }
            else{
                vitrine.metodos.mensagem('Formato de CEP inválido.');
                $("#txtCEP").focus();
            }

        }
        else {
            vitrine.metodos.mensagem('Informe o CEP, por favor.');
            $("#txtCEP").focus();
        }
    },
    
    //valida~]ap antes de prosseguir para a etapa 3
    resumoPedido: () => {

        let cep = $("#txtCEP").val().trim();
        let endereco = $("#txtEndereco").val().trim();
        let bairro = $("#txtBairro").val().trim();
        let cidade = $("#txtCidade").val().trim();
        let uf = $("#ddlUF").val().trim();
        let numero = $("#txtNumero").val().trim();
        let complemento = $("#txtComplemento").val().trim();

        if(cep.length <= 0) {
            vitrine.metodos.mensagem('Informe o CEP, por favor.');
            $("#txtCEP").focus();
            return;
        }

        if(endereco.length <= 0) {
            vitrine.metodos.mensagem('Informe o endereço, por favor.');
            $("#txtEndereco").focus();
            return;
        }

        if(bairro.length <= 0) {
            vitrine.metodos.mensagem('Informe o bairro, por favor.');
            $("#txtBairro").focus();
            return;
        }

        if(cidade.length <= 0) {
            vitrine.metodos.mensagem('Informe a cidade, por favor.');
            $("#txtCidade").focus();
            return;
        }

        if(uf == "-1") {
            vitrine.metodos.mensagem('Informe a UF, por favor.');
            $("#ddlUF").focus();
            return;
        }

        if(numero.length <= 0) {
            vitrine.metodos.mensagem('Informe o número, por favor.');
            $("#txtNumero").focus();
            return;
        }

        MEU_ENDERECO =  {
            cep: cep,
            endereco: endereco,
            bairro: bairro,
            cidade: cidade,
            uf: uf,
            numero: numero,
            complemento: complemento 
        }

        vitrine.metodos.carregarEtapa(3);
        vitrine.metodos.carregarResumo();

    },

    // carrega a etapa de resumo do pedido
     carregarResumo: () => {

        $("#listaItensResumo").html('');

        $.each(MINHA_BAG, (i, e) => {

            let temp = vitrine.templates.itemResumo.replace(/\${img}/g, e.img)
                .replace(/\${nome}/g, e.name)
                .replace(/\${preco}/g, e.price.toFixed(2).replace('.',','))
                .replace(/\${qntd}/g, e.qntd)

                $("#listaItensResumo").append(temp);

        });

        $("#resumoEndereco").html(`${MEU_ENDERECO.endereco}, ${MEU_ENDERECO.numero}, ${MEU_ENDERECO.bairro}`);
        $("#cidadeEndereco").html(`${MEU_ENDERECO.cidade}-${MEU_ENDERECO.uf} / ${MEU_ENDERECO.cep} ${MEU_ENDERECO.complemento}`);

        vitrine.metodos.finalizarPedido();
     },

     // Atualiza o link do botão WhatsApp
     finalizarPedido: () => {

        if (MINHA_BAG.length > 0 && MINHA_BAG != null) {

            var texto = 'Olá! gostaria de fazer um pedido:';
            texto += `\n*Itens do pedido:*\n\n\${itens}`;
            texto += '\n*Endereço de entrega:*';
            texto += `\n${MEU_ENDERECO.endereco}, ${MEU_ENDERECO.numero}, ${MEU_ENDERECO.bairro}`;
            texto += `\n${MEU_ENDERECO.cidade}-${MEU_ENDERECO.uf} / ${MEU_ENDERECO.cep} ${MEU_ENDERECO.complemento}`;
            texto += `\n\n*Total (com entrega): R$ ${(VALOR_BAG + VALOR_ENTREGA).toFixed(2).replace('.',',')}*`;

            var itens = '';

            $.each(MINHA_BAG, (i, e) => {

                itens += `*${e.qntd}x* ${e.name} ....... R$ ${e.price.toFixed(2).replace('.',',')} \n`;

                if ((i + 1) == MINHA_BAG.length) {

                    // ultimo item
                    texto = texto.replace(/\${itens}/g, itens);

                   // converte a URL
                   let encode = encodeURI(texto);
                   let URL = `https://wa.me/${CELEULAR_EMPRESA}?text=${encode}`;

                   $("#btnEtapaResumo").attr('href', URL);

                }

            })

        }
     },
    

     // carregar botão WhatsApp
     carregarBotaoWhatsApp: () => {

        var texto = 'Olá! vim através do site.';

        let encode = encodeURI(texto);
        let URL = `https://wa.me/${CELEULAR_EMPRESA}?text=${encode}`;

        $("#btnWhatsApp").attr('href', URL);
        $("#btnWhatsAppFooter").attr('href', URL);
     },

     //abrir depoimentos
     abrirDepoimento: (depoimento) => {
        $("#depoimento-1").addClass('hidden');
        $("#depoimento-2").addClass('hidden');
        $("#depoimento-3").addClass('hidden');

        $("#btnDepoimento-1").removeClass('active');
        $("#btnDepoimento-2").removeClass('active');
        $("#btnDepoimento-3").removeClass('active');

        $("#depoimento-" + depoimento).removeClass('hidden');
        $("#btnDepoimento-" + depoimento).addClass('active');

     },
    
    
    
    
    mensagem: (texto, cor = 'red', tempo = 3500) => {

        let id = Math.floor(Date.now() * Math.random()).toString();

       let msg = `<div id="msg-${id}" class="animated fadeInDown toast ${cor}">${texto}</div>`;

       $("#container-mensagens").append(msg);

       setTimeout(() => {
        $("#msg-" + id).removeClass('fadeInDown');
        $("#msg-" + id).addClass('fadeOutUp');
        setTimeout(() => {
            $("#msg-" + id).remove();
        }, 800);
       }, tempo)
    }
}



vitrine.templates = {


     item: `<div class="col-12 col-lg-3 col-md-3 col-sm-6 mb-5 animated fadeInUp">
     <div class="card card-item" id="\${id}">
         <div class="img-produto">
             <img src="\${img}" />
         </div>
         <p class="title-produto text-center mt-4">
             <b>\${nome}</b>
         </p>
         <p class="price-produto text-center">
             <b>R$ \${preco}</b>
         </p>
         <div class="add-carrinho">
             <span class="btn-menos" onclick="vitrine.metodos.diminunirQuantidade('\${id}')"><i class="fa fa-minus"></i></span>
             <span class="add-numero-itens" id="qntd-\${id}">0</span>
             <span class="btn-mais" onclick="vitrine.metodos.aumentarQuantidade('\${id}')"><i class="fa fa-plus"></i></span>
             <span class="btn btn-add" onclick="vitrine.metodos.adicionarABag('\${id}')"><i class="fa fa-shopping-bag"></i></span>
         </div>
     </div>
 </div>`,

 itemBag: `
        <div class="col-12 item-bag">
        <div class="img-produto">
            <img src="\${img}" />
        </div>
        <div class="dados-produto">
            <p class="title-produto"><b>\${nome}</b></p>
            <p class="price-produto"><b>R$ \${preco}</b></p>
        </div>
        <div class="add-carrinho">
        <span class="btn-menos" onclick="vitrine.metodos.diminunirQuantidadeBag('\${id}')"><i class="fa fa-minus"></i></span>
        <span class="add-numero-itens" id="qntd-bag-\${id}">\${qntd}</span>
        <span class="btn-mais" onclick="vitrine.metodos.aumentarQuantidadeBag('\${id}')"><i class="fa fa-plus"></i></span>
            <span class="btn btn-remove no-mobile" onclick="vitrine.metodos.removerItemABag('\${id}')"><i class="fa fa-times"></i></span>
        </div>
        </div>`,

itemResumo: `
        <div class="col-12 item-bag resumo">
        <div class="img-produto-resumo">
            <img src="\${img}" />
        </div>
        <div class="dados-produto">
            <p class="title-produto-resumo">
                <b>\${nome}</b>
            </p>
            <p class="price-produto-resumo">
                <b>\${preco}</b>
            </p>
        </div>
        <p class="quantidade-produto-resumo">
            x <b>\${qntd}</b>
        </p>
        </div>            
`

}