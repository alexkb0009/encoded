from snovault import (
    AuditFailure,
    audit_checker,
)


def audit_library_nih_consent(value, system):
    '''
    Check if library from human biosample and ENCODE4 award has NIH consent identifier.
    '''
    if 'award' not in value or 'biosample' not in value:
        return
    # Skip ENTEx samples.
    if 'ENTEx' in value.get('biosample', {}).get('internal_tags', []):
        return
    if (value.get('award', {}).get('rfa') == 'ENCODE4'
            and value.get('biosample',
                          {}).get('organism',
                                  {}).get('scientific_name') == 'Homo sapiens'):
        nih_consent = value.get('nih_consent')
        if nih_consent is not None and len(nih_consent) != 0:
            return
        detail = 'Library {} is missing the NIH consent identifier required for human data in'\
                 ' ENCODE 4.'.format(value['@id'])
        yield AuditFailure('missing nih_consent', detail, level='ERROR')
    # This return follows pattern of other audits.
    return


function_dispatcher = {
    'audit_nih_consent': audit_library_nih_consent,
}


@audit_checker('Library',
               frame=['biosample.organism',
                      'award'])
def audit_libary(value, system):
    for function_name in function_dispatcher.keys():
        for failure in function_dispatcher[function_name](value, system):
            yield failure
