import pytest


def test_audit_library_missing_nih_consent(testapp, library, encode4_award):
    testapp.patch_json(library['@id'], {'award': encode4_award['@id']})
    res = testapp.get(library['@id'] + '@@index-data')
    errors = res.json['audit']
    errors_list = []
    for error_type in errors:
        errors_list.extend(errors[error_type])
    assert any(error['category'] == 'missing nih_consent'
               for error in errors_list)


def test_audit_library_with_nih_consent(testapp, library, encode4_award):
    testapp.patch_json(library['@id'], {'award': encode4_award['@id'],
                                        'nih_consent': 'HS1234'})
    res = testapp.get(library['@id'] + '@@index-data')
    errors = res.json['audit']
    errors_list = []
    for error_type in errors:
        errors_list.extend(errors[error_type])
    assert all(error['category'] != 'missing nih_consent'
               for error in errors_list)
