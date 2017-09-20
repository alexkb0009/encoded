import React from 'react';
import PropTypes from 'prop-types';
import { Panel } from '../libs/bootstrap/panel';
import * as globals from './globals';
import { FacetList } from './search';


// Render the title pane.
const SummaryTitle = (props) => {
    const { context } = props;

    return (
        <div className="summary-header__title">
            {context.title}
        </div>
    );
};

SummaryTitle.propTypes = {
    context: PropTypes.object.isRequired, // Summary search result object
};


// Render the horizontal facets.
const SummaryHorzFacets = (props) => {
    const { context } = props;

    return (
        <div className="summary-header__facets-horizontal">
            <FacetList
                facets={xFacets}
                filters={context.filters}
                orientation="horizontal"
                searchBase={matrixSearch}
                onFilter={this.onFilter}
            />
        </div>
    );
};

SummaryHorzFacets.propTypes = {
    context: PropTypes.object.isRequired, // Summary search result object
};


// Render the vertical facets.
const SummaryVertFacets = (props) => {
    const { context } = props;

    return (
        <div className="summary-facets-vertical">
        </div>
    );
};

SummaryVertFacets.propTypes = {
    context: PropTypes.object.isRequired, // Summary search result object
};


// Render the data for the summary.
const SummaryData = (props) => {
    const { context } = props;

    return (
        <div className="summary-data">
        </div>
    );
};

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
