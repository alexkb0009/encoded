from snovault import (
    AuditFailure,
    audit_checker,
)


def audit_library_nih_consent(value, system):
    if 'award' not in value:
        return
    if value['award']['rfa'] == 'ENCODE4':
        detail = 'NIH consent number is required for human data in ENCODE 4.'
        yield AuditFailure('missing nih_consent', detail, level='INTERNAL_ACTION')
    return


function_dispatcher = {
    'audit_nih_consent': audit_library_nih_consent,
}


@audit_checker('Library',
               frame=['biosample.organism',
                      'award'])
def audit_file(value, system):
    for function_name in function_dispatcher.keys():
        for failure in function_dispatcher[function_name](value, system):
            yield failure
