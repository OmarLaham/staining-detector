
var runID = undefined;
var mainChart = null;
var mainChartWinStart = 0
var mainChartWinEnd = 100
var tblDEGsContent = null

function createMainChart(data) {

    mainChart = Highcharts.stockChart('main-chart', {

        rangeSelector: {
            selected: 1
        },

        xAxis: {
            events: {
                setExtremes: (event) => {
                    mainChartWinStart = Math.round(event.min);
                    mainChartWinEnd = Math.round(event.max);

                    $('#win-len').text(mainChartWinEnd - mainChartWinStart + 1);
                    //console.log(mainChartWinStart + " - " + mainChartWinEnd);
                    //event.preventDefault();
                }
            },
        },

        yAxis: {
            labels: {
                formatter: function () {
                    return this.value;
                }
            },
            plotLines: [{
                value: 0,
                width: 2,
                color: 'silver'
            }]
        },

        plotOptions: {
            series: {
                //compare: 'percent',
                showInNavigator: true
            }
        },

        tooltip: {
            pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b><br/>',
            valueDecimals: 2,
            split: true
        },

        series: data['chart-series'],

        navigator: {
            series: {
                data: data['nav-series']
            }
        },
    });
}

function getPointCategoryName(point, dimension) {
    var series = point.series,
        isY = dimension === 'y',
        axis = series[isY ? 'yAxis' : 'xAxis'];
    return axis.categories[point[isY ? 'y' : 'x']];
}

function createWinHeatmap(data) {

    Highcharts.chart('gex-err-heatmap', {

        chart: {
            type: 'heatmap',
            marginTop: 40,
            marginBottom: 80,
            plotBorderWidth: 1,
            height: 200
        },


        title: {
            text: ''
        },

        xAxis: {
            categories: data['x-axis']
        },

        yAxis: {
            categories: ['Prediction Error'],
            title: 'Prediction Error',
            reversed: true
        },

        accessibility: {
            point: {
                descriptionFormatter: function (point) {
                    var ix = point.index + 1,
                        geneName = getPointCategoryName(point, 'x'),
                        yName = getPointCategoryName(point, 'y'),
                        val = point.value;
                    return geneName + ' pred. err = ~' + val + '%';
                }
            }
        },

        colorAxis: {
            min: 0,
            minColor: '#FFFFFF',
            maxColor: Highcharts.getOptions().colors[0]
        },

        legend: {
            align: 'right',
            layout: 'vertical',
            margin: 0,
            verticalAlign: 'top',
            y: 25,
            symbolHeight: 280
        },

        tooltip: {
            formatter: function () {
                return '<b>' + getPointCategoryName(this.point, 'x') + '</b><br><b>Pred. Err: </b> ~' +
                    this.point.value + '%';
            }
        },

        series: [{
            name: 'pred-err',
            borderWidth: 1,
            data: data['pred-err-series'], //[[0, 0, 10], [0, 1, 19], [0, 2, 8], [0, 3, 24], [0, 4, 67], [1, 0, 92], [1, 1, 58], [1, 2, 78], [1, 3, 117], [1, 4, 48], [2, 0, 35], [2, 1, 15], [2, 2, 123], [2, 3, 64], [2, 4, 52], [3, 0, 72], [3, 1, 132], [3, 2, 114], [3, 3, 19], [3, 4, 16], [4, 0, 38], [4, 1, 5], [4, 2, 8], [4, 3, 117], [4, 4, 115], [5, 0, 88], [5, 1, 32], [5, 2, 12], [5, 3, 6], [5, 4, 120], [6, 0, 13], [6, 1, 44], [6, 2, 88], [6, 3, 98], [6, 4, 96], [7, 0, 31], [7, 1, 1], [7, 2, 82], [7, 3, 32], [7, 4, 30], [8, 0, 85], [8, 1, 97], [8, 2, 123], [8, 3, 64], [8, 4, 84], [9, 0, 47], [9, 1, 114], [9, 2, 31], [9, 3, 48], [9, 4, 91]],
            dataLabels: {
                enabled: true,
                color: '#000000'
            }
        }],

        responsive: {
            rules: [{
                condition: {
                    maxWidth: 500
                },
                chartOptions: {
                    yAxis: {
                        labels: {
                            formatter: function () {
                                return this.value.charAt(0);
                            }
                        }
                    }
                }
            }]
        }

    });


}


//This function is disabled
function createWordCloud(containerID, data) {

    return;

    const text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean bibendum erat ac justo sollicitudin, quis lacinia ligula fringilla. Pellentesque hendrerit, nisi vitae posuere condimentum, lectus urna accumsan libero, rutrum commodo mi lacus pretium erat. Phasellus pretium ultrices mi sed semper. Praesent ut tristique magna. Donec nisl tellus, sagittis ut tempus sit amet, consectetur eget erat. Sed ornare gravida lacinia. Curabitur iaculis metus purus, eget pretium est laoreet ut. Quisque tristique augue ac eros malesuada, vitae facilisis mauris sollicitudin. Mauris ac molestie nulla, vitae facilisis quam. Curabitur placerat ornare sem, in mattis purus posuere eget. Praesent non condimentum odio. Nunc aliquet, odio nec auctor congue, sapien justo dictum massa, nec fermentum massa sapien non tellus. Praesent luctus eros et nunc pretium hendrerit. In consequat et eros nec interdum. Ut neque dui, maximus id elit ac, consequat pretium tellus. Nullam vel accumsan lorem.',
    lines = text.split(/[,\. ]+/g),
    dataTmp = lines.reduce((arr, word) => {
    let obj = Highcharts.find(arr, obj => obj.name === word);
    if (obj) {
      obj.weight += 1;
    } else {
      obj = {
        name: word,
        weight: 1
      };
      arr.push(obj);
    }
    return arr;
    }, []);

    Highcharts.chart(containerID, {
        accessibility: {
            screenReaderSection: {
                beforeChartFormat: '<h5>{chartTitle}</h5>' +
                    '<div>{chartSubtitle}</div>' +
                    '<div>{chartLongdesc}</div>' +
                    '<div>{viewTableButton}</div>'
            }
        },
        series: [{
            type: 'wordcloud',
            data: dataTmp,
            name: 'go-terms'
        }],
        title: {
            text: ''
        }
    });

    console.log("hi");
}

function renderTblTermTOGenes(term, intersection_genes, study_type) {

    alert("Finding Genes related to term: " + term + ". This takes can take up to 2 minutes, please be patient.")

    const json_term_to_genes = `/json_${study_type}_term_to_genes/${term}/${intersection_genes}`;

    $.get(json_term_to_genes, function(response) {
    })
    .done(function(response) {
        if (response) {
            let data = response;
            console.log(data);

            var html = ""
            const genes = data["result"]

            for (const [key, value] of Object.entries(genes)) {
                html += "<tr>"
                const gene = key;

                //GET intersection between terms and (related DEGS from selected window only)
                if (intersection_genes.includes(gene) == false) {
                    continue;
                }

                const gene_desc = value["gene_description"];
                const gene_lnk = value["gene_lnk"];

                html += "<td class=\"text-center\" style=\"font-weight: bold\">" + gene + "</td>";
                html += "<td class=\"text-info\"><a target=\"_blank\" href=" + gene_lnk + ">Gene Card</a></td>";
                html += "<td>" + gene_desc + "</td>";
                html += "</tr>";

            }

            $("#tbl-term-to-genes tbody").html(html)

            const myModal = new bootstrap.Modal('#modal-term-to-genes', {
              keyboard: false
            })
            myModal.toggle();
        }
    })
    .fail(function() {
        alert( "Error . Please try again later." );
    })

}

function createEnrichmentBarChart(containerID, data, intersectionGenes, regulation="enriched") {//regulation can be up or down

    if (["enriched", "up-regulated", "down-regulated"].includes(regulation) == false) {
        alert("Error: wrong regulation type for encrichment bar chart. Must be 'enriched', 'up' or 'down'.")
        return;
    }

    let TEST_MODE = false;
    //categories
    var categories = (TEST_MODE) ? ["(term1)", "(t2)", "(t3)", "(t4)"] : data[regulation]["terms"];

    Highcharts.chart(containerID, {
        chart: {
            type: 'bar'
        },
        title: {
            text: ''
        },
        subtitle: {
            text: data["database"]
        },
        xAxis: [{
            categories: categories,
            reversed: false,
            labels: {
                step: 1
            }
        }],
        yAxis: {
            title: {
                text: null
            },
            labels: {
                formatter: function () {
                    return '';//parseFloat(this.value).toFixed(3);
                }
            }
        },

        plotOptions: {
            series: {
                stacking: 'normal'
            }
        },

        tooltip: {
        formatter: function () {
            return '<b>' + this.series.name + ', Term: ' + this.point.category + '</b><br/>' +
            '-log10 P-val: ' +  -1 * Math.log10(parseFloat(this.point.y));
            }
        },

        series: [
            {
                name: 'Terms',
                data: data[regulation]["pvals"],
                cursor: 'pointer',
                color: (regulation === "enriched" || regulation == "up-regulated") ? '#F8766D' : '#619CFF',
                point: {
                    events: {
                        click: function () {
                            //it's a string , => "Empty" is passed
                            if($.type(intersectionGenes) === "string")
                            {
                                intersectionGenes = "Empty"; //assign value again for backend
                            }
                            else { //it's a list of genes
                                intersectionGenes = intersectionGenes.join(",")
                            }

                            if(containerID == "win-go-enriched-barchart") {
                                const term = this.category.substring(0, this.category.indexOf(' (GO:'));
                                renderTblTermTOGenes(term, intersectionGenes, "go");
                            }
                            else if (containerID == "win-kegg-enriched-barchart") { //TODO: add functionality to run whole profile enrichment analysis for selected term
                                alert('Category: ' + this.category);
                            }
                        }
                    }
                }
            }
        ]
    });

}

function createColChart(containerID, data, yLabelsEnabled = false) {//regulation can be up or down

    Highcharts.chart(containerID, {
        chart: {
            type: 'column'
        },
        title: {
            text: 'Count of Chr-DEGs in the Selected Window'
        },
        subtitle: {
            text: ''
        },
        xAxis: {
            categories: data["chromosomes"]
        },
        yAxis: {
            title: {
                text: ''
            },
            labels: {
                enabled: yLabelsEnabled
            }

        },
        plotOptions: {
            series: {
                stacking: 'normal'
            }
        },

        tooltip: {
        formatter: function () {
                return '<b>Chr: ' + this.point.category + '</b><br/>' + this.point.y + ' DEG(s)';
            }
        },

        series: [
            {
                name: 'Chr-DEGs Count ',
                colorByPoint: true,
                data: data['series']
            }
        ]
    });

}

function displayWinOnNavigator(winStart, winEnd) {

    //scroll to page top
    $('html,body').animate({ scrollTop: 0 }, 'slow', function () {
        //move navigaor to selected win
        mainChart.xAxis[0].setExtremes(winStart, winEnd);
    });



}


function startWinSelectedBioAnalysis() {

    //win pred. err. heatmap
    //creat window heatmap
    json_window_heatmap_url = `/json_win_heatmap/${runID}/${mainChartWinStart}/${mainChartWinEnd}`
    $.get(json_window_heatmap_url, function(response) {
    })
        .done(function(response) {
            if (response) {

                let data = response;
                console.log(data);

                //change values of pred-err-mean and pred-err-sum spans
                let predErrMean = data["pred-err-mean"];
                let predErrSum = data["pred-err-sum"];
                $('#pred-err-mean').text(predErrMean);
                $('#pred-err-sum').text(predErrSum);

                createWinHeatmap(data);

                //show win heatmap div
                $('#win-heatmap').removeClass('d-none');

                //scroll to heatmap
                $('html, body').animate({ scrollTop:$('#win-heatmap').position().top }, 'slow', function () {});
            }
        })
        .fail(function() {
            alert( "Error in fetching heatmap data. Please try again later." );
        })

    console.log("bio win selected analysis starting..");


    json_win_selected_bio_analysis = `/json_win_selected_bio_analysis/${runID}/${mainChartWinStart}/${mainChartWinEnd}`;
    $.get(json_win_selected_bio_analysis, function(response) {
    })
      .done(function(response) {
          if (response) {
              let data = response;
              console.log(data);



              let includedGenes = data['tbl-included-genes'];
              var tblIncludedGenesHTML = ""

              for(let i = 0; i < includedGenes.length; i++) {
                  const includedGene = includedGenes[i];
                  const gene = includedGene[0]
                  const symbol = includedGene[1]
                  const std = includedGene[2]

                  tblIncludedGenesHTML += "<tr>";
                  tblIncludedGenesHTML += "<td class =\"text-gray-900\" scope=\"row\">" + gene + "</td>";
                  tblIncludedGenesHTML += "<td class =\"text-gray-500\" scope=\"row\">" + symbol + "</td>";
                  tblIncludedGenesHTML += "<td class =\"text-gray-500\" scope=\"row\">" + std + "</td>";
                  tblIncludedGenesHTML += "</tr>";

              }

              $("#tbl-win-included-genes > tbody").html(tblIncludedGenesHTML);

              const tblTopDEGs = data['tbl-top-degs'];
              //save DEGs csv content exported by server to be ready for table download button
              const tblDEGsContent = data['tbl-top-degs-csv'];
              //generate html for top degs table
              var tbl_top_degs_html = ""
              for (let i = 0; i < tblTopDEGs.length; i++) {
                  const topDEG = tblTopDEGs[i];
                  const iterator = topDEG[0];
                  const deg_ensl_id = topDEG[1];
                  const deg_symbol = topDEG[2];
                  const deg_pval = topDEG[3];
                  const deg_adj_pval = topDEG[4];
                  const deg_log2_fc = topDEG[5];

                  tbl_top_degs_html += "<tr>";

                  tbl_top_degs_html += "<td class =\"text-gray-900\" scope=\"row\">" + iterator + "</td>";
                  tbl_top_degs_html += "<td class =\"text-gray-500\" scope=\"row\">" + deg_ensl_id + "</td>";
                  tbl_top_degs_html += "<td class =\"text-gray-500\" scope=\"row\">" + deg_symbol + "</td>";
                  tbl_top_degs_html += "<td class =\"text-gray-500\" scope=\"row\">" + deg_pval + "</td>";
                  tbl_top_degs_html += "<td class =\"text-gray-500\" scope=\"row\">" + deg_adj_pval + "</td>";
                  tbl_top_degs_html += "<td class =\"text-gray-500\" scope=\"row\">" + deg_log2_fc + "</td>";

                  tbl_top_degs_html += "</tr>";

              }


              $('#tbl-top-win-degs > tbody').html(tbl_top_degs_html);

              let dataDEAChrGeneCnt = data['data-dea-chr-gene-cnt'];
              createColChart('win-chr-degs-counts-colchart', dataDEAChrGeneCnt);

              //create selected win GO word cloud & barchart
              let dataGOBarChart = data['data-go']['bar-chart']; //will contain data for up and down regulated
              //we have to pass degs because there is a the render.. function inside createEnrichmentBarChart that can needs them
              createEnrichmentBarChart('win-go-enriched-barchart', dataGOBarChart, includedGenes, 'enriched');
              //createEnrichmentBarChart('win-go-up-barchart', dataGOBarChart, 'up-regulated');
              //createEnrichmentBarChart('win-go-down-barchart', dataGOBarChart, 'down-regulated');
              //createWordCloud('win-go-word-cloud', dataGOWordCloud);

              //create selected win KEGG analysis word cloud & barchart
              let dataKEGGChartBar = data['data-kegg']['bar-chart']; //will contain data for up and down regulated
              //we have to pass degs because there is a the render.. function inside createEnrichmentBarChart that can needs them
              createEnrichmentBarChart('win-kegg-enriched-barchart', dataKEGGChartBar, includedGenes, 'enriched');
              //createEnrichmentBarChart('win-kegg-up-barchart', dataKEGGChartBar, 'up-regulated');
              //createEnrichmentBarChart('win-kegg-down-barchart', dataKEGGChartBar, 'down-regulated');
              //createWordCloud('win-kegg-word-cloud', dataKEGGWordCloud);

              //show win-info sidebar
              $('#win-info').removeClass('d-none');

              console.log("bio win selected analysis end.");
          }
      })
      .fail(function() {
            alert( "Error in starting the biological analysis. Please try again later." );
      })

}

function startWinLenBioAnalysis() {
    let n_wins = parseInt($('#txt-n-wins').val());
    let win_len = mainChartWinEnd - mainChartWinStart + 1;
    let win_step = 5;

    console.log("bio win len analysis starting..");

    json_win_len_bio_analysis = `/json_win_len_bio_analysis/${runID}/${n_wins}/${win_len}/${win_step}`;
    $.get(json_win_len_bio_analysis, function(response) {

    })
      .done(function(response) {
          if (response) {
              let data = response;
              console.log(data);

              topWinsTblHTML = data["top-wins-tbl-html"];
              $("#tbl-win-len > tbody").html(topWinsTblHTML);

              //show top-wins-info div
              $('#top-wins-info').removeClass("d-none");

              console.log("bio win len analysis end.");
          }

      })
      .fail(function() {
            alert( "Error in starting the biological analysis. Please try again later." );
      })
}

function download(filename, text) {

    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);

}

$(document).ready(function() {

    const window_url_chunks = window.location.href.split("/")
    runID = window_url_chunks[window_url_chunks.length - 1]

    //creat main-chart
    json_main_chart_url = "/json_main_chart/" + runID;
    $.get(json_main_chart_url, function(response) {
    })
      .done(function(response) {
          if (response) {
              let data = response;
              console.log(data);
              createMainChart(data);
          }
      })
      .fail(function() {
            alert( "Error in fetching main chart data. Please try again later." );
      })

    //bind events

    $('#btn-win-selected-bio-analysis').click(function() {
        startWinSelectedBioAnalysis();
    });

    $('#btn-win-len-bio-analysis').click(function() {
        startWinLenBioAnalysis();
    });

    $('#btn-download-degs').click(function() {
       download("degs.csv", tblDEGsContent);
    });


});

