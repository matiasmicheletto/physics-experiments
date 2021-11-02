/*
    *Inicializador-Controlador del grafico
    *Ejemplo de uso:

    Flotter.initialize();

    data = [
        {data:[t,x],
         label: "posicion",
         vble: ["t = ","x = "],
         unit: ["s","m"]},
        {data:[t,v],
         label: "velocidad",
         vble: ["t = ","v = "],
         unit: [" s"," m/s"]}
            ];
			
	Flotter.data = data; // <-- Hacer solo una vez
    Flotter.draw();
	
	
	{
		data = ...
		Flotter.draw();
	
	}
*/

var Flotter = {
    placeHldr : document.getElementById("placeholder"), // Div para el grafico
    legend : document.getElementById("legend"), // Div para las leyendas

    // Dimensiones
    w: 200,
    h: 200,
    top: 10,
    left: 10,

	data: [],
	
    // Opciones de grafico
    options : {
        series: {
            lines: {
                show: true,
                fill: true,
                fillColor: { colors: [{ opacity: 0 }, { opacity: 0.4}] }
            }
        },
        xaxis: {
            ticks: 10,
            min: 0,
            max: 0.1
        },
        yaxis: {
            ticks: 10,
            min: 0,
            max: 0.1
        },
        grid: {
          backgroundColor: { colors: ["#F7F7F7","#E8E8E8"] },
          color:"#000000",
            borderWidth: {
                top: 1,
                right: 1,
                bottom: 2,
                left: 2
            },
            hoverable: true
        },
        legend: {
            container: $("#legend"),
            color:"#000000"
        },
        colors: ["#51E549","#FF7070","#248289"]
    },

    initialize : function() {
        this.placeHldr.style.top="10px";
        this.placeHldr.style.left="10px";
        this.placeHldr.style.width="200px";
        this.placeHldr.style.height="200px";
        this.placeHldr.style.margin="0";
        this.placeHldr.style.padding="0";
        this.placeHldr.style.position="absolute";
        this.placeHldr.style.border="2px solid grey";
        this.placeHldr.style.background="-webkit-linear-gradient(top,rgba(247,247,247,50),white)";
        this.placeHldr.style.background="-o-linear-gradient(top,rgba(247,247,247,50),white)";
        this.placeHldr.style.background="-moz-linear-gradient(top,rgba(247,247,247,50),white)";
        this.placeHldr.style.background="linear-gradient(top,rgba(247,247,247,50),white)";

        this.legend.style.top="20px";
        this.legend.style.left="20px";
        this.legend.style.position="absolute";

        $("<div id='tooltip'></div>").css({
                                              position: "absolute",
                                              display: "none",
                                              padding: "5px",
                                              color: "#2f2f2f",
                                              "font-family":"arial",
                                              "font-weight": "bolder"
                                          }).appendTo("body");

        $("#placeholder").bind("plothover", function (event, pos, item) {
            if (item) {
                var x = item.datapoint[0].toFixed(2),
                        y = item.datapoint[1].toFixed(2),
                        varName = item.series.vble,
                        unit = item.series.unit;

                $("#tooltip").html(varName[0]+x+unit[0]+"<br>"+varName[1]+y+unit[1])
                .css({top: item.pageY+5, left: item.pageX+5})
                .fadeIn(200);
            } else {
                $("#tooltip").hide();
            }
        });

        this.flot = $.plot("#placeholder", [[], []], this.options);
    },

    draw : function(){
		this.flot.setData(this.data);
	
        // Ajustar escala horizontal superior
        if( this.flot.getAxes().xaxis.datamax > this.flot.getOptions().xaxes[0].max )
          this.flot.getOptions().xaxes[0].max = this.flot.getAxes().xaxis.datamax;
        
        // Ajustar escala horizontal inferior
        if( this.flot.getAxes().xaxis.datamin < this.flot.getOptions().xaxes[0].min )
          this.flot.getOptions().xaxes[0].min = this.flot.getAxes().xaxis.datamin;

        // Ajustar escala vertical superior
        if( this.flot.getAxes().yaxis.datamax > this.flot.getOptions().yaxes[0].max )
            this.flot.getOptions().yaxes[0].max = this.flot.getAxes().yaxis.datamax;

        // Ajustar escala vertical inferior
        if( this.flot.getAxes().yaxis.datamin < this.flot.getOptions().yaxes[0].min )
            this.flot.getOptions().yaxes[0].min = this.flot.getAxes().yaxis.datamin;

        this.flot.setupGrid(); // No es necesario hacerlo siempre
        this.flot.draw();
    },

    clear : function(){ // Borrar y restablecer grafico
        this.flot.setData([[],[]]);
        this.flot.getOptions().yaxes[0].min = 0;
        this.flot.getOptions().yaxes[0].max = 0.1;
        this.flot.getOptions().xaxes[0].min = 0;
        this.flot.getOptions().xaxes[0].max = 0.1;
        this.flot.setupGrid();
        this.flot.draw();
    },

    setHidden : function(hide){ // Ocultar o mostrar grafico
        this.placeHldr.hidden = hide;
        this.legend.hidden = hide;
    },

    setSize : function(w,h){ // Cambiar dimensiones
        this.w = w; this.h = h;
        this.placeHldr.style.width = w.toString()+"px";
        this.placeHldr.style.height = h.toString()+"px";

        this.legend.style.top = (this.top + 10).toString()+"px";
        this.legend.style.left = (this.w+this.left-125).toString()+"px";

        this.flot = $.plot("#placeholder", [[], []], this.options);
    },

    setPos : function(top,left){ // Cambiar posicion
        this.top = top; this.left = left;
        this.placeHldr.style.top = top.toString()+"px";
        this.placeHldr.style.left = left.toString()+"px";

        this.legend.style.top = (this.top + 10).toString()+"px";
        this.legend.style.left = (this.w+this.left-125).toString()+"px";

        this.flot = $.plot("#placeholder", [[], []], this.options);
    }
}
