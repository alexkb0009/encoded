import unittest
import sys

from encoded.commands.deploy import parse_args


DEFAULT_KWARGS = {
    'branch': None,
    'check_price': False,
    'cluster_name': None,
    'cluster_size': 2,
    'elasticsearch': None,
    'image_id': 'ami-1c1eff2f',
    'instance_type': 'c4.4xlarge',
    'name': None,
    'profile_name': None,
    'role': 'demo',
    'spot_price': '0.70',
    'spot_instance': False,
    'teardown_cluster': None,
    'wale_s3_prefix': 's3://encoded-backups-prod/production',
}

ARGS_DATA = [
    # short, long, key, value
    ('-b', '--branch', 'branch', 'fake-branch-name'),
    (None, '--check-price', 'check_price', True),
    (None, '--cluster-name', 'cluster_name', 'fake-cluster-name'),
    (None, '--cluster-size', 'cluster_size', 'fake-cluster-size'),
    (None, '--elasticsearch', 'elasticsearch', 'fake-elasticsearch'),
    (None, '--image-id', 'image_id', 'fake-image-id'),
    (None, '--instance-type', 'instance_type', 'fake-instance-type'),
    ('-n', '--name', 'name', 'fake-instance-name'),
    (None, '--profile-name', 'profile_name', 'fake-profile-name'),
    (None, '--candidate', 'role', 'candidate'),
    (None, '--spot-instance', 'spot_instance', True),
    (None, '--spot-price', 'spot_price', 'fake-price'),
    (None, '--test', 'role', 'test'),
    (None, '--teardown-cluster', 'teardown_cluster', 'fake-teardown-cluster'),
    (None, '--wale-s3-prefix', 'wale_s3_prefix', 'fake-prefix'),
]


class TestDeployArgs(unittest.TestCase):
    """
    Tests the src/encoded/commands/depoly.py script parse args
    """
    BIN_TEST_ARGS = []

    @classmethod
    def setup_class(cls):
        """
        Save args from bin/test command
        """
        cls.BIN_TEST_ARGS = sys.argv[1:]

    @classmethod
    def teardown_class(cls):
        """
        Return args from bin/test command
        """
        sys.argv = sys.argv[0:1].extend(cls.BIN_TEST_ARGS)

    def setup_method(self, test_method):
        """
        Removes commands added during testings
        """
        sys.argv = sys.argv[0:1]

    def test_arg_defaults(self):
        """
        Tests that parse_args output has correct key/value pairs
        The keys in DEFAULT_KWARGS must be present
        with the correct default values.
        """
        result = parse_args()
        self.assertDictEqual(DEFAULT_KWARGS, result)

    def test_arg_longs(self):
        """
        Tests that each long arg is parsed correctly
        """
        for short_arg, long_arg, key, value in ARGS_DATA:
            if long_arg:
                sys.argv = sys.argv[0:1]
                copy_kwargs = DEFAULT_KWARGS.copy()
                copy_kwargs[key] = value
                if isinstance(value, bool):
                    # Boolean args do not pass in thier value args
                    sys.argv.extend([long_arg])
                elif 'role' == key:
                    # role key is const so does not pass in a value arg
                    sys.argv.extend([long_arg])
                else:
                    sys.argv.extend([long_arg, copy_kwargs[key]])
                result = parse_args()
                self.assertDictEqual(copy_kwargs, result)

    def test_arg_shorts(self):
        """
        Tests that each long arg is parsed correctly
        """
        for short_arg, long_arg, key, value in ARGS_DATA:
            if short_arg:
                sys.argv = sys.argv[0:1]
                copy_kwargs = DEFAULT_KWARGS.copy()
                copy_kwargs[key] = value
                sys.argv.extend([short_arg, copy_kwargs[key]])
                result = parse_args()
                self.assertDictEqual(copy_kwargs, result)

    def test_hostname_invalid(self):
        """
        Tests that invalid hostname returns as SystemExits
        """
        hostname = '///##$Asdf-1234'
        sys.argv.extend(['-n', hostname])
        try:
            parse_args()
        except SystemExit:
            pass
        else:
            assert False
