"""
AI-moduler for eiendomsanalyse og kommunikasjon med kommunale datasett.
"""

from .AlterraML import AlterraML, PropertyData
from .CommuneConnect import CommuneConnect

__all__ = ['AlterraML', 'PropertyData', 'CommuneConnect'] 