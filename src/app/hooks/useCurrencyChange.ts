// lib/useCurrencyConversion.js
import { useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie";

const useCurrencyConversion = (aedValue) => {
  // State for the converted value
  const [convertedValue, setConvertedValue] = useState(aedValue || 0);

  // Fixed exchange rates (as of February 2025, approximate)
  const exchangeRates = {
    USD: 0.2723, // 1 AED = 0.2723 USD
    EUR: 0.2510, // 1 AED = 0.2510 EUR
    AED: 1,      // 1 AED = 1 AED (no conversion)
  };

  // Get currency from cookies or default to AED
  const getCurrentCurrency = useCallback(() => {
    return Cookies.get("currency") || "AED";
  }, []);

  // Convert the AED value to the current currency
  const convertCurrency = useCallback((value, currency) => {
    if (!value || isNaN(value)) return 0;
    return value * exchangeRates[currency];
  }, [exchangeRates]);

  // Update converted value when aedValue or currency changes
  useEffect(() => {
    const currentCurrency = getCurrentCurrency();
    const newValue = convertCurrency(aedValue, currentCurrency);
    setConvertedValue(newValue);
  }, [aedValue, getCurrentCurrency, convertCurrency]);

  // Function to manually update currency (e.g., when user changes it)
  const updateCurrency = (newCurrency) => {
    Cookies.set("currency", newCurrency, { expires: 365 }); // Save for 1 year
    const newValue = convertCurrency(aedValue, newCurrency);
    setConvertedValue(newValue);
  };

  // Return the converted value, current currency, and update function
  return {
    convertedValue,
    currentCurrency: getCurrentCurrency(),
    updateCurrency,
    exchangeRates, // Optional: expose rates for debugging or custom use
  };
};

export default useCurrencyConversion;