## Changelog for publication.json

### Schema version 5

* Remove in press, in revision, planned, replaced from statuses


### Schema version 4

* *aliases* now must be properly namespaced according lab.name:alphanumeric characters with no leading or trailing spaces
* unsafe characters such as " # @ % ^ & | ~ ; ` [ ] { } and consecutive whitespaces will no longer be allowed in the alias

### Schema version 3

* array properties *identifers*, *datasets*, *categories*, and *published_by* will now only allow for unique elements.

### Schema version 2

* *references* property was renamed to *identifiers*
