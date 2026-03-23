import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))))
from wa_tax_calc.household import calculate_household_impact  # noqa
