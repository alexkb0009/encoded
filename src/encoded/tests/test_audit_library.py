import pytest


def test_audit_library_nih_consent_(testapp, library, encode4_award):
    testapp.patch_json(library['@id'], {'award': encode4_award['@id']})
    res = testapp.get(library['@id'] + '@@index-data')
    errors = res.json['audit']
    errors_list = []
    for error_type in errors:
        errors_list.extend(errors[error_type])
    print(errors_list)
    assert any(error['category'] == 'missing nih_consent'
               for error in errors_list)
