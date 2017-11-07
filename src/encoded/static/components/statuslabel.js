import React from 'react';
import PropTypes from 'prop-types';
import * as globals from './globals';


// objectStatuses holds all possible statuses for each kind of object at the different logged-in
// levels. These must be kept in sync with statuses defined in each object's schema. Each top-level
// property has a name matching the @type of each kind of object. Within that property is an array
// of arrays; each array defining the statuses available at each logged-in level. The order
// currently corresponds to
//     * [0] public - viewable regardless of logged-in state
//     * [1] consortium - viewable if you're loggged in as a consortium member
//     * [2] admin - viewable if you're logged in as an admin
// So any statuses in the [0] array are 'public' statuses viewable by anyone regardless of
// logged-in state. [1] or 'consortium' includes 'public' statuses as well as anything in the [1]
// array. [2] or 'admin' includes statuses in 'public' and 'consortium' as well as anything in this
// array.
const objectStatuses = {
    Experiment: [
        [
            'released',
            'archived',
            'revoked',
        ],
        [
            'proposed',
            'started',
            'submitted',
        ],
        [
            'deleted',
            'replaced',
        ],
    ],
};


// Defines the order of the viewing access of the different logged-in states, and has to match the
// order of arrays in each @type property in `objectStatuses`. So currently 'public' corresponds to
// the [0] array for each @type in `objectStatuses`, 'consortium' corresponds to the [1] array, and
// 'admin' corresponds to the [2] array. This array just makes it so we can map a logged-in level
// string to each @type array entry in `objectStatuses`.
const objectStatusLevelOrder = ['public', 'consortium', 'admin'];


/**
 * Given an object @id and login level, get an array of all possible statuses for that object at
 * that login level.
 *
 * @param {string} objectType - @id of the object whose possible statuses
 * @param {string} level - Level of statuses to get (public, consortium, admin). If nothing is
 *         passed in this parameter, then 'admin' is assumed.
 * @return (array) - Returns array of possible statuses for the given object and access level
 */
export function getObjectStatuses(objectType, level) {
    const maxLevelIndex = objectStatusLevelOrder.indexOf(level || 'admin');
    const objectStatusGroups = objectStatuses[objectType];
    if (maxLevelIndex !== -1 && objectStatusGroups) {
        let statuses = [];
        let levelIndex = 0;
        while (levelIndex <= maxLevelIndex) {
            statuses = statuses.concat(objectStatusGroups[levelIndex]);
            levelIndex += 1;
        }
        return statuses;
    }

    // Should never happen, but in case `objectType` or `level` isn't a valid value, return an
    // empty array.
    return [];
}


export const StatusLabel = (props) => {
    const { status, title, buttonLabel, fileStatus } = props;

    // Handle file statuses speficially.
    if (fileStatus) {
        return (
            <ul className="status-list">
                <li className={`label file-status-${status.replace(/ /g, '-')}`}>
                    {title ? <span className="status-list-title">{`${title}: `}</span> : null}
                    {buttonLabel || status}
                </li>
            </ul>
        );
    }

    // Handle any other kind of status.
    if (typeof status === 'string') {
        // Display simple string and optional title in badge
        return (
            <ul className="status-list">
                <li className={globals.statusClass(status, 'label')}>
                    {title ? <span className="status-list-title">{`${title}: `}</span> : null}
                    {buttonLabel || status}
                </li>
            </ul>
        );
    } else if (typeof status === 'object') {
        // Display a list of badges from array of objects with status and optional title
        return (
            <ul className="status-list">
                {status.map(singleStatus => (
                    <li key={singleStatus.title} className={globals.statusClass(singleStatus.status, 'label')}>
                        {singleStatus.title ? <span className="status-list-title">{`${singleStatus.title}: `}</span> : null}
                        {singleStatus.status}
                    </li>
                ))}
            </ul>
        );
    }
    return null;
};

StatusLabel.propTypes = {
    status: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.array,
    ]).isRequired, // Array of status objects with status and badge title
    title: PropTypes.string,
    buttonLabel: PropTypes.string,
    fileStatus: PropTypes.bool,
};

StatusLabel.defaultProps = {
    title: '',
    buttonLabel: '',
    fileStatus: false,
};
