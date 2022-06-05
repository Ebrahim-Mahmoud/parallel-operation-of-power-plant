                  

array_start=[]
array_end=[]
document.getElementById("capacity").value=320
document.getElementById("i1").value="210+6x+0.005x^2"
document.getElementById("i2").value="205+6x+0.004x^2"
document.getElementById("i3").value="200+7.5x"

capacity=320
// load=900
// array_start=[6,7.5,6]
// array_end=[9.2,7.5,8.5]
// 210+9x+0.005x^2
// 205+6x+0.004x^2
// 200+7.5x
curve_x=[]
curve_y=[]
need_correction=NaN
station_loads=[]
function Heat_Rate(equ) {
    array_start.push(math.derivative(equ, 'x').evaluate({x: 0}))
    array_end.push(math.derivative(equ, 'x').evaluate({x: capacity}))
}
// function responsible for interpolation for each plant
function interop(y,y1,y2) {
    x=((y-y1)/(y2-y1))
    x=x*capacity
    if(x==Infinity){
        if (y>y2) {
            x=capacity
        } else {
            x=0
        }
    }
    if (x<0 || isNaN(x)) {
        x=0
    }
    else{
        if (x>capacity) {
            x=capacity
        }
    }
    return x
}

// function to get the x of the summation curve of specific y value
function get_x(y,x_intial){
    
    x_coordinate=0
    for (let index = 0; index < array_start.length; index++) {
        y1=array_start[index];
        y2=array_end[index];
        x_coordinate=x_coordinate+interop(y,y1,y2);
        if (y==y1 && y==y2) {
            x_coordinate=x_coordinate+x_intial
        } 
    }
    
    return x_coordinate
}


// function to get the x of the summation curve of for y array
function get_x_array(array,x_intial){
    for (let index = 0; index < array.length; index++) {
        y=array[index]
        get_x(y,x_intial)
        curve_x.push(x_coordinate)
        curve_y.push(y)
    }
    curve_x.sort(function(a, b) {
        return a - b;
      });
    curve_y.sort(function(a, b) {
        return a - b;
      });
    // console.log(curve_x)
    return(curve_x,curve_y)
}



// function to get the load of each station 
function Solve(load,curve_x,curve_y){
    const clamp = (a, min = 0, max = 1) => Math.min(max, Math.max(min, a));
    const invlerp = (x, y, a) => clamp((a - x) / (y - x));
    var index = curve_x.findIndex(n => n > load);
    percentage = invlerp(curve_x[index-1], curve_x[index], load)
    y_summation_curve=percentage*(curve_y[index]-curve_y[index-1])+curve_y[index-1]
    console.log(y_summation_curve)
    for (let index = 0; index < array_start.length; index++) {
        y=y_summation_curve
        y1=array_start[index];
        y2=array_end[index];
        if (y>y2) {
            // console.log(capacity);
            station_loads.push(capacity);
        }else if(y==y2){
            need_correction=index;
            station_loads.push(capacity);
        }
        else{
            // console.log(interop(y,y1,y2))
            station_loads.push(interop(y,y1,y2))
        };
    }
    correction=math.abs(load-station_loads.reduce((a, b) => a + b, 0))
    if (isNaN(need_correction)) {
        
    } else {
        station_loads[need_correction]=station_loads[need_correction]-correction
    }
    console.log(station_loads)
    correction=0
    y_summation_curve=0
    percentage =0
}
//solve button function

function Solve_button() {
    need_correction=NaN
    station_loads=[]
    load=document.getElementById('load_input').value
    Solve(load,curve_x,curve_y)
    row_table()
}
//---------------------------------------------------------//
// Heat_Rate('210+6x+0.005x^2')
// Heat_Rate('200+7.5x')
// Heat_Rate('205+6x+0.004x^2')
// get_x_array(array_start,0)
// get_x_array(array_end,capacity)
// Solve(load,curve_x,curve_y)


// Draw()
//******************************************************* */
//Drawing code
function Draw(){
    values_summation_curve=[]
    //create points object
    function points(x,y,values){
        point={x:x,y:y}
        values.push(point)
    }
    // draw the summation curve
    function data_values(array_x,array_y){
        for (let index = 0; index < array_x.length; index++) {
            x=array_x[index]
            y=array_y[index]
            points(x,y,values_summation_curve)
            
        }
    }



    data_values(curve_x,curve_y)

    var data = {
        // labels: labels,
        datasets: [{
        label: 'summation curve',
        backgroundColor: 'rgb(255, 99, 132)',
        borderColor: 'rgb(255, 99, 132)',
        data: values_summation_curve,
        showLine: true,
        },]


    };

    var config = {
        type: 'scatter',
        data: data,
        options: {
            responsive: true,
            scales: {
            x: {
                display: true,
                title: {
                display: true,
                text: 'load',
                color: 'green',
                font: {
                    family: 'Comic Sans MS',
                    size: 20,
                    weight: 'bold',
                    lineHeight: 1.2,
                },
                padding: {top: 20, left: 0, right: 0, bottom: 0}
                }
            },
            y: {
                display: true,
                title: {
                display: true,
                text: 'I.H.R',
                color: '#911',
                font: {
                    family: 'Comic Sans MS',
                    size: 20,
                    weight: 'bold',
                    lineHeight: 1.2,
                },
                padding: {top: 20, left: 0, right: 0, bottom: 0}
                }
            },
        }}}



    colors_array=["green","blue","orange","#ff3300","#ffff00","#0059f2"]
    let alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
    //draw incremental heat rate for each station
    for (let index = 0; index < array_start.length; index++) {
        
        color=colors_array[index]
        data.datasets.push(
            {label: 'station '+(alphabet[index]),
            backgroundColor: color,
            borderColor: color,
            data: [{x:0,y:array_start[index]},{x:capacity,y:array_end[index],}],
            showLine: true,
            })
    
    }






    //Render the chart
    chart=new Chart(
        document.getElementById('myChart'),
        config
    );
    
}
//function for the draw button and updating the chart
counter=0
function Draw_button() {
    if (counter==0) {
        capacity =parseFloat(document.getElementById("capacity").value)
        Heat_Rate(document.getElementById("i1").value)
        Heat_Rate(document.getElementById("i2").value)
        Heat_Rate(document.getElementById("i3").value)
        get_x_array(array_start,0)
        get_x_array(array_end,capacity)
        Draw()
    }else{
    
    array_start=[]
    array_end=[]
    curve_x=[]
    curve_y=[]
    need_correction=NaN
    station_loads=[]
    chart.destroy()
    capacity =parseFloat(document.getElementById("capacity").value)
    Heat_Rate(document.getElementById("i1").value)
    Heat_Rate(document.getElementById("i2").value)
    Heat_Rate(document.getElementById("i3").value)
    get_x_array(array_start,0)
    get_x_array(array_end,capacity)
    Draw()
   
}
    counter=counter+1
}
//function for table

//define variable for table 
// define list of rows of the table
var row =[];
// define list each cell in the row
var cell1=[];
var cell2=[];
var cell3=[];
var cell4=[];
function row_table(index_table){
    i=index_table
    table = document.getElementById("myTable");
    row[i] = table.insertRow(-1); //insert row at the end of the table
    cell1[i] = row[i].insertCell(0);
    cell2[i] = row[i].insertCell(1);
    cell3[i] = row[i].insertCell(2);
    cell4[i] = row[i].insertCell(3);

    cell1[i].innerHTML = load;
    cell2[i].innerHTML = station_loads[0].toFixed(2);
    cell3[i].innerHTML = station_loads[1].toFixed(2);
    cell4[i].innerHTML = station_loads[2].toFixed(2);
    
}
