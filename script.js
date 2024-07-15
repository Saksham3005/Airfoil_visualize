



let camberSlider, thicknessSlider, windSpeedSlider, reynoldsNumberSlider, angleOfAttackSlider, nacaNumberInput, plotButton;
let camber = 10, thickness = 10, windSpeed = 10, reynoldsNumber = 50000, angleOfAttack = 0, nacaNumber = "2412";
let liftCoefficient = 0.0, dragCoefficient = 0.0, efficiency = 0.0;

function setup() {
    let canvas = createCanvas(800, 600);
    canvas.parent('canvasContainer');
    
    camberSlider = select('#camber');
    thicknessSlider = select('#thickness');
    windSpeedSlider = select('#windSpeed');
    reynoldsNumberSlider = select('#reynoldsNumber');
    angleOfAttackSlider = select('#angleOfAttack');
    nacaNumberInput = select('#naca-number');
    plotButton = select('#plot-button');
    
    camberSlider.input(updateParameters);
    thicknessSlider.input(updateParameters);
    windSpeedSlider.input(updateParameters);
    reynoldsNumberSlider.input(updateParameters);
    angleOfAttackSlider.input(updateParameters);
    plotButton.mousePressed(updateParameters);

    updateParameters();
}

function draw() {
    background(255);
    drawAirfoil();
    calculateCoefficients();
    updateDisplay();
}

function naca4(m, p, t, numPoints = 100) {
    const x = d3.range(numPoints).map(i => i / (numPoints - 1));
    const yt = x.map(xi => 5 * t * (
        0.2969 * Math.sqrt(xi) -
        0.1260 * xi -
        0.3516 * Math.pow(xi, 2) +
        0.2843 * Math.pow(xi, 3) -
        0.1015 * Math.pow(xi, 4)
    ));
    const yc = x.map(xi => xi < p ? 
        m / Math.pow(p, 2) * (2 * p * xi - Math.pow(xi, 2)) :
        m / Math.pow(1 - p, 2) * ((1 - 2 * p) + 2 * p * xi - Math.pow(xi, 2))
    );
    const dyc_dx = x.map(xi => xi < p ? 
        2 * m / Math.pow(p, 2) * (p - xi) :
        2 * m / Math.pow(1 - p, 2) * (p - xi)
    );
    const theta = dyc_dx.map(Math.atan);

    const xu = x.map((xi, i) => xi - yt[i] * Math.sin(theta[i]));
    const yu = x.map((xi, i) => yc[i] + yt[i] * Math.cos(theta[i]));
    const xl = x.map((xi, i) => xi + yt[i] * Math.sin(theta[i]));
    const yl = x.map((xi, i) => yc[i] - yt[i] * Math.cos(theta[i]));

    const xCoords = xu.concat(xl.reverse());
    const yCoords = yu.concat(yl.reverse());

    return { x: xCoords, y: yCoords };
}

function drawAirfoil() {
    let m = parseInt(nacaNumber[0]) / 100;
    let p = parseInt(nacaNumber[1]) / 10;
    let t = parseInt(nacaNumber.substring(2)) / 100;

    // Generate the airfoil coordinates
    let { x, y } = naca4(m, p, t);

    // D3.js plotting
    d3.select("#plot").selectAll("*").remove();
    const width = 800;
    const height = 600;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };

    const svg = d3.select("#plot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top - 100})`); // Adjust translation

    const xScale = d3.scaleLinear()
        .domain([0, 1])
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([-0.5, 0.5]) // Adjust y domain to ensure the entire airfoil is visible
        .range([height, 0]);

    const line = d3.line()
        .x((d, i) => xScale(x[i]))
        .y((d, i) => yScale(y[i]));

    svg.append("path")
        .datum(y)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", line);

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale));

    svg.append("g")
        .call(d3.axisLeft(yScale));
}

function updateParameters() {
    camber = parseInt(camberSlider.value());
    thickness = parseInt(thicknessSlider.value());
    windSpeed = parseInt(windSpeedSlider.value());
    reynoldsNumber = parseInt(reynoldsNumberSlider.value());
    angleOfAttack = parseInt(angleOfAttackSlider.value());
    nacaNumber = nacaNumberInput.value();

    select('#camberValue').html(camber);
    select('#thicknessValue').html(thickness);
    select('#windSpeedValue').html(windSpeed);
    select('#reynoldsNumberValue').html(reynoldsNumber);
    select('#angleOfAttackValue').html(angleOfAttack);
}

function calculateCoefficients() {
    // Simplified lift and drag coefficient calculations
    liftCoefficient = 0.1 * camber * cos(radians(angleOfAttack));
    dragCoefficient = 0.01 * thickness * sin(radians(angleOfAttack));
    efficiency = liftCoefficient / dragCoefficient;
}

function updateDisplay() {
    select('#liftCoefficient').html(liftCoefficient.toFixed(2));
    select('#dragCoefficient').html(dragCoefficient.toFixed(2));
    select('#efficiency').html(efficiency.toFixed(2));
}






