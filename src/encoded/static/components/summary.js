import React from 'react';
import PropTypes from 'prop-types';
import url from 'url';
import { Panel } from '../libs/bootstrap/panel';
import { LabChart, CategoryChart, StatusExperimentChart, createBarChart } from './award';
import * as globals from './globals';
import { FacetList } from './search';


// Render the title pane.
const SummaryTitle = (props) => {
    const { context } = props;

    return (
        <div className="summary-header__title">
            <h1>{context.title}</h1>
        </div>
    );
};

SummaryTitle.propTypes = {
    context: PropTypes.object.isRequired, // Summary search result object
};


class SummaryStatusChart extends React.Component {
    constructor() {
        super();
        this.createChart = this.createChart.bind(this);
        this.updateChart = this.updateChart.bind(this);
    }

    componentDidMount() {
        if (this.props.totalStatusData) {
            this.createChart(this.chartId, this.props.statusData);
        }
    }

    componentDidUpdate() {
        if (this.props.statuses.length) {
            if (this.chart) {
                this.updateChart(this.chart);
            } else {
                this.createChart(this.chartId);
            }
        } else if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
    }

    updateChart(chart) {
        const { experiments, unreplicated, isogenic, anisogenic, linkUri, award, objectQuery } = this.props;
        // Object with arrays of status labels, unreplicatedDataset, isogenicDataset, anisogenicDataset
        const data = StatusData(experiments, unreplicated, isogenic, anisogenic);
        const replicatelabels = ['unreplicated', 'isogenic', 'anisogenic'];
        const colors = replicatelabels.map((label, i) => statusColorList[i % statusColorList.length]);
        // Must specify each case of data availability - must remove available, data-less chart.data.datasets
        // Ensures that the colors will be the default and legend labels does not include unnecessary strings
        if (data.unreplicatedDataset.some(x => x > 0)) {
            chart.data.datasets[0] = { label: 'unreplicated', data: data.unreplicatedDataset, backgroundColor: colors[0] };
            if (data.isogenicDataset.some(x => x > 0)) {
                chart.data.datasets[1] = { label: 'isogenic', data: data.isogenicDataset, backgroundColor: colors[1] };
                if (data.anisogenicDataset.some(x => x > 0)) {
                    chart.data.datasets[2] = { label: 'anisogenic', data: data.anisogenicDataset, backgroundColor: colors[2] };
                } else if (data.anisogenicDataset.every(x => x === 0)) {
                    chart.data.datasets[2] = {};
                }
            } else if (data.isogenicDataset.every(x => x === 0) && data.anisogenicDataset.some(x => x > 0)) {
                chart.data.datasets[1] = { label: 'anisogenic', data: data.anisogenicDataset, backgroundColor: colors[1] };
                chart.data.datasets[2] = {};
            }
        } else if (data.unreplicatedDataset.every(x => x === 0) && data.isogenicDataset.some(x => x > 0)) {
            chart.data.datasets[0] = { label: 'isogenic', data: data.isogenicDataset, backgroundColor: colors[0] };
            if (data.anisogenicDataset.some(x => x > 0)) {
                chart.data.datasets[1] = { label: 'anisogenic', data: data.anisogenicDataset, backgroundColor: colors[1] };
                chart.data.datasets[2] = {};
            } else if (data.anisogenicDataset.every(x => x === 0)) {
                chart.data.datasets[1] = {};
                chart.data.datasets[2] = {};
            }
        } else if (data.unreplicatedDataset.every(x => x === 0) && data.isogenicDataset.every(x => x === 0) && data.anisogenicDataset.some(x => x > 0)) {
            chart.data.datasets[0] = { label: 'anisogenic', data: data.anisogenicDataset, backgroundColor: colors[0] };
            chart.data.datasets[1] = {};
            chart.data.datasets[2] = {};
        }
        chart.options.onClick.baseSearchUri = `${linkUri}${award ? award.name : ''}${objectQuery}`;
        chart.update();

        document.getElementById(`${statusChartId}-${this.props.ident}-legend`).innerHTML = chart.generateLegend();
    }

    createChart(chartId) {
        const { experiments, unreplicated, isogenic, anisogenic } = this.props;
        // Object with arrays of status labels, unreplicatedDataset, isogenicDataset, anisogenicDataset
        const data = StatusData(experiments, unreplicated, isogenic, anisogenic);
        const replicatelabels = ['unreplicated', 'isogenic', 'anisogenic'];
        const colors = replicatelabels.map((label, i) => statusColorList[i % statusColorList.length]);

        createBarChart(chartId, data, colors, replicatelabels, `${this.props.linkUri}${this.award ? this.props.award.name : ''}`, (uri) => { this.context.navigate(uri); })
            .then((chartInstance) => {
                // Save the created chart instance.
                this.chart = chartInstance;
            });
    }

    render() {
        const { totalStatusData, ident } = this.props;

        // Calculate a (hopefully) unique ID to put on the DOM elements.
        this.chartId = `status-chart-${ident}`;

        return (
            <div className="award-charts__chart">
                <div className="award-charts__title">
                    Status
                </div>
                {totalStatusData ?
                    <div className="award-charts__visual">
                        <div id={this.chartId} className="award-charts__canvas">
                            <canvas id={`${this.chartId}-chart`} />
                        </div>
                        <div id={`${this.chartId}-legend`} className="award-charts__legend" />
                    </div>
                :
                    <div className="chart-no-data" style={{ height: this.wrapperHeight }}>No data to display</div>
                }
            </div>
        );
    }
}

SummaryStatusChart.propTypes = {
    statusData: PropTypes.object.isRequired, // Experiment status data from /summary/ search results
    totalStatusData: PropTypes.number.isRequired, // Total number of statuses to chart
    ident: PropTypes.string.isRequired, // Unique identifier to `id` the charts
    statuses: PropTypes.array, // Array of status facet data
    linkUri: PropTypes.string.isRequired, // URI to use for matrix links
    experiments: PropTypes.object.isRequired,
    unreplicated: PropTypes.object,
    anisogenic: PropTypes.object,
    isogenic: PropTypes.object,
    objectQuery: PropTypes.string,
};

SummaryStatusChart.defaultProps = {
    award: null,
    statuses: [],
    unreplicated: {},
    anisogenic: {},
    isogenic: {},
    objectQuery: '',
};

SummaryStatusChart.contextTypes = {
    navigate: PropTypes.func,
};


// Render the horizontal facets.
class SummaryHorzFacets extends React.Component {
    constructor() {
        super();

        // Bind `this` to non-React methods
        this.onFilter = this.onFilter.bind(this);
    }

    onFilter(e) {
        const search = e.currentTarget.getAttribute('href');
        this.context.navigate(search);
        e.stopPropagation();
        e.preventDefault();
    }

    render() {
        const { context } = this.props;
        const { location_href } = this.context;
        const allFacets = context.facets;

        // Get the array of facet field values to display in the horizontal facet area.
        const horzFacetFields = context.summary.x.facets;

        // Extract the horizontal facets from the list of all facets. We use the array of horizontal
        // facet field values of facets that should appear in the horizontal facets.
        const horzFacets = allFacets.filter(facet => horzFacetFields.indexOf(facet.field) >= 0);

        // Calculate the searchBase, which is the current search query string fragment that can have
        // terms added to it.`
        const searchBase = `${url.parse(location_href).search}&` || '?';

        return (
            <div className="summary-header__facets-horizontal">
                <FacetList
                    facets={horzFacets}
                    filters={context.filters}
                    orientation="horizontal"
                    searchBase={searchBase}
                    onFilter={this.onFilter}
                />
            </div>
        );
    }
}

SummaryHorzFacets.propTypes = {
    context: PropTypes.object.isRequired, // Summary search result object
};

SummaryHorzFacets.contextTypes = {
    location_href: PropTypes.string, // Current URL
    navigate: PropTypes.func, // encoded navigation
};


// Render the vertical facets.
class SummaryVertFacets extends React.Component {
    constructor() {
        super();

        // Bind `this` to non-React methods.
        this.onFilter = this.onFilter.bind(this);
    }

    onFilter(e) {
        const search = e.currentTarget.getAttribute('href');
        this.context.navigate(search);
        e.stopPropagation();
        e.preventDefault();
    }

    render() {
        const { context } = this.props;
        const { location_href } = this.context;
        const allFacets = context.facets;

        // Get the array of facet field values to display in the horizontal facet area.
        const vertFacetFields = context.summary.y.facets;

        // Extract the horizontal facets from the list of all facets. We use the array of horizontal
        // facet field values of facets that should appear in the horizontal facets.
        const vertFacets = allFacets.filter(facet => vertFacetFields.indexOf(facet.field) >= 0);

        // Calculate the searchBase, which is the current search query string fragment that can have
        // terms added to it.`
        const searchBase = `${url.parse(location_href).search}&` || '?';

        return (
            <div className="summary-content__facets-vertical">
                <FacetList
                    facets={vertFacets}
                    filters={context.filters}
                    searchBase={searchBase}
                    onFilter={this.onFilter}
                />
            </div>
        );
    }
}

SummaryVertFacets.propTypes = {
    context: PropTypes.object.isRequired, // Summary search result object
};

SummaryVertFacets.contextTypes = {
    location_href: PropTypes.string, // Current URL
    navigate: PropTypes.func, // encoded navigation
};


// Render the data for the summary.
class SummaryData extends React.Component {
    render() {
        const { context } = this.props;

        // Find the labs facet in the search results.
        const labFacet = context.facets.find(facet => facet.field === 'lab.title');
        const assayFacet = context.facets.find(facet => facet.field === 'assay_title');
        const labs = labFacet ? labFacet.terms : null;
        const assays = assayFacet ? assayFacet.terms : null;

        // Get the status data with a process completely different from the others because it comes
        // in its own property in the /summary/ context. Start by getting the name of the property
        // that contains the status data, as well as the number of items within it.
        const statusProp = context.summary.summary_grouping[0];
        const statusSection = context.summary[statusProp];
        const statusDataCount = statusSection.doc_count;
        const statusData = statusSection[statusProp];

        return (
            <div className="summary-content__data">
                {labs ? <LabChart labs={labs} linkUri="/matrix/?type=Experiment&" ident="experiments" /> : null}
                {assays ? <CategoryChart categoryData={assays} categoryFacet="assay_title" title="Assays" linkUri="/matrix/?type=Experiment&" ident="assays" /> : null}
                {statusDataCount ? <SummaryStatusChart statusData={statusData} ident="status" /> : null}
            </div>
        );
    }
}

SummaryData.propTypes = {
    context: PropTypes.object.isRequired, // Summary search result object
};


// Render the title panel and the horizontal facets.
const SummaryHeader = (props) => {
    const { context } = props;

    return (
        <div className="summary-header">
            <SummaryTitle context={context} />
            <SummaryHorzFacets context={context} />
        </div>
    );
};

SummaryHeader.propTypes = {
    context: PropTypes.object.isRequired, // Summary search result object
};


// Render the vertical facets and the summary contents.
const SummaryContent = (props) => {
    const { context } = props;

    return (
        <div className="summary-content">
            <SummaryVertFacets context={context} />
            <SummaryData context={context} />
        </div>
    );
};

SummaryContent.propTypes = {
    context: PropTypes.object.isRequired, // Summary search result object
};


// Render the entire summary page based on summary search results.
const Summary = (props) => {
    const { context } = props;
    const itemClass = globals.itemClass(context, 'view-item');

    return (
        <Panel addClasses={itemClass}>
            <SummaryHeader context={context} />
            <SummaryContent context={context} />
        </Panel>
    );
};

Summary.propTypes = {
    context: PropTypes.object.isRequired, // Summary search result object
};

globals.contentViews.register(Summary, 'Summary');
