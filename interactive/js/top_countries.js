export function plot_top_countries(data, region_map) {
    var countries = [];
    var energy = [];

    Object.keys(data[0]).forEach(function(key) {
        countries.push(key);
        energy.push(+data[0][key]);
    });

    var region_mapping = {};
    region_map.forEach(function(d) {
        region_mapping[d['NAME']] = d['region'];
    });

    const svg = d3.select('svg');

    const margin = {
        top: 80,
        bottom: 80,
        left: 80,
        right: 80
    };

    const width = +svg.attr('width') - margin.left - margin.right;
    const height = +svg.attr('height') - margin.top - margin.bottom;

    const chart = svg
        .select('g')
        .append('g')
        .attr('id', 'top_countries_ratio')
        .attr('transform', `translate(${margin.left},100)`)
        .style('opacity', 0)
        .style('pointer-events', 'none');

    const grp = chart
        .append('g')
        .attr('transform', `translate(-${margin.left},-${margin.top})`);

    // Create scales
    const yScale = d3
        .scaleLinear()
        .range([height, 0])
        .domain([d3.min(energy), d3.max(energy)]);

    const xScale = d3
        .scaleLinear()
        .range([width, 0])
        .domain([1, countries.length + 1]);

    // Add the X Axis
    chart
        .append('g')
        .attr('transform', 'translate(0,' + height + ')')
        .call(d3.axisBottom(xScale))
        .append('text')
        .attr('x', width)
        .attr('y', '3em')
        .style('text-anchor', 'end')
        .style('fill', 'gray')
        .style('font-size', '1.1em')
        .text('Country Ranking');

    // Add the Y Axis
    chart
        .append('g')
        .attr('transform', `translate(0, 0)`)
        .call(d3.axisLeft(yScale))
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -margin.left)
        .attr('dy', '3em')
        .style('text-anchor', 'end')
        .style('fill', 'gray')
        .style('font-size', '1.1em')
        .text('Renewable Energy Generated / Total Energy Consumed');

    // Add title
    chart
        .append('text')
        .attr('x', width / 2)
        .attr('y', -20)
        .text('Countries Ranked By Renewable Ratio, 2018')
        .style('text-anchor', 'middle')
        .style('font-weight', '800');

    var tooltip = d3
        .select('#vis')
        .append('div')
        .attr('class', 'tooltipscatter')
        .style('opacity', 0);

    var color = d3.scaleOrdinal(d3.schemeCategory10);

    chart
        .append('g')
        .selectAll('dot')
        .data(energy)
        .enter()
        .append('circle')
        .attr('class', 'dot')
        .style('pointer-events', 'none')
        .style('opacity', 0)
        .attr('cx', function(d, i) {
            return xScale(i + 1);
        })
        .attr('cy', 0)
        .attr('r', 3)
        .style('fill', function(d, i) {
            return color(region_mapping[countries[i]]);
        })
        .on('mouseover', function(d, i) {
            tooltip
                .transition()
                .duration(200)
                .style('opacity', 0.9);
            tooltip
                .html(
                    countries[i] +
                        '<br/> Rank: ' +
                        (i + 1) +
                        '<br/> Renewable Percent: ' +
                        (d * 100).toFixed(1) +
                        '%'
                )
                .style('top', yScale(d) + 'px')
                .style('left', xScale(i + 1) + 'px')
                .style('display', 'block');
        })
        .on('mouseout', function(d) {
            tooltip
                .transition()
                .duration(500)
                .style('opacity', 0);
        });

    // Code adapted from http://bl.ocks.org/weiglemc/6185069
    // legend
    var legend = chart
        .append('g')
        .attr('transform', 'translate(' + (-width + 100) + ',0)')
        .selectAll('.legend')
        .data(color.domain())
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr('transform', function(d, i) {
            return 'translate(0,' + i * 20 + ')';
        });

    // legend colors
    legend
        .append('circle')
        .attr('cx', width - 10)
        .attr('cy', 6)
        .attr('r', 4)
        .style('fill', color)
        .style('opacity', 0.9);

    // legend text
    legend
        .append('text')
        .attr('x', width - 24)
        .attr('y', 5)
        .attr('dy', '.35em')
        .style('text-anchor', 'end')
        .text(d => d);

    return function() {
        d3.selectAll('.dot')
            .style('pointer-events', 'all')
            .transition()
            .delay(function(d, i) {
                return (countries.length - i) * 20;
            })
            .attr('cy', function(d) {
                return yScale(d);
            })
            .style('opacity', 0.8);
    };
}
