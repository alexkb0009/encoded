import React from 'react';
import PropTypes from 'prop-types';
import url from 'url';
import { Panel } from '../libs/bootstrap/panel';
import { LabChart, CategoryChart, StatusExperimentChart } from './award';
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
        const statusFacet = context.facets.find(facet => facet.field === 'status');
        const labs = labFacet ? labFacet.terms : null;
        const assays = assayFacet ? assayFacet.terms : null;
        const statuses = statusFacet ? statusFacet.terms : null;

        return (
            <div className="summary-content__data">
                {labs ? <LabChart labs={labs} linkUri="/matrix/?type=Experiment&" ident="experiments" /> : null}
                {assays ? <CategoryChart categoryData={assays} categoryFacet="assay_title" title="Assays" linkUri="/matrix/?type=Experiment&" ident="assays" /> : null}
                {statuses ?
                    <StatusExperimentChart
                        experiments={experiments}
                        statuses={experimentsConfig.statuses || []}
                        linkUri={experimentsConfig.linkUri}
                        ident={experimentsConfig.ident}
                        unreplicated={unreplicated}
                        isogenic={isogenic}
                        anisogenic={anisogenic}
                        selectedOrganisms={updatedGenusArray}
                        objectQuery={ExperimentQuery}
                    />
                : null}
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
