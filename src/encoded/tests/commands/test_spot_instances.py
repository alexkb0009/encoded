import unittest

from encoded.commands.deploy import spot_client


class TestSpotInstances(unittest.TestCase):
    """
    Tests the src/encoded/commands/depoly.py script spot instance functions
    """
    def test_spot_client_defaults(self):
        """
        Tests spot_client class default instantiation
        """
        expected_result = {
            '_spotClient': None,
        }
        client = spot_client()
        result = vars(client)
        self.assertDictEqual(expected_result, result)

    def test_spot_client_properties(self):
        """
        Tests spot_client class properties
        """
        expected_properties = [
            'spotClient',
        ]
        client = spot_client()
        client_type = type(client)
        for prop in expected_properties:
            class_attribute = getattr(client_type, prop, None)
            self.assertIsInstance(class_attribute, property, prop)
