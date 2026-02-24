import React, { useState } from "react";
import { Calculator as CalcIcon, Delete } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function CalculatorDialog({ open, onOpenChange }) {
  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [newNumber, setNewNumber] = useState(true);

  const handleNumber = (num) => {
    if (newNumber) {
      setDisplay(num);
      setNewNumber(false);
    } else {
      setDisplay(display === "0" ? num : display + num);
    }
  };

  const handleDecimal = () => {
    if (newNumber) {
      setDisplay("0.");
      setNewNumber(false);
    } else if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  };

  const handleOperation = (op) => {
    const current = parseFloat(display);
    
    if (previousValue === null) {
      setPreviousValue(current);
    } else if (operation) {
      const result = calculate(previousValue, current, operation);
      setDisplay(String(result));
      setPreviousValue(result);
    }
    
    setOperation(op);
    setNewNumber(true);
  };

  const calculate = (a, b, op) => {
    switch (op) {
      case "+": return a + b;
      case "-": return a - b;
      case "×": return a * b;
      case "÷": return a / b;
      default: return b;
    }
  };

  const handleEquals = () => {
    if (operation && previousValue !== null) {
      const current = parseFloat(display);
      const result = calculate(previousValue, current, operation);
      setDisplay(String(result));
      setPreviousValue(null);
      setOperation(null);
      setNewNumber(true);
    }
  };

  const handleClear = () => {
    setDisplay("0");
    setPreviousValue(null);
    setOperation(null);
    setNewNumber(true);
  };

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay("0");
      setNewNumber(true);
    }
  };

  const buttons = [
    ["7", "8", "9", "÷"],
    ["4", "5", "6", "×"],
    ["1", "2", "3", "-"],
    ["0", ".", "=", "+"],
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalcIcon className="w-5 h-5 text-blue-600" />
            Calculator
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {/* Display */}
          <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 p-6 rounded-xl border border-white/10 mb-4">
            <div className="text-right">
              {operation && previousValue !== null && (
                <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">
                  {previousValue} {operation}
                </div>
              )}
              <div className="text-3xl font-semibold text-zinc-900 dark:text-white break-all">
                {display}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div>
            {/* Clear and Backspace */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              <Button
                onClick={handleClear}
                variant="destructive"
                className="h-12 text-base font-semibold"
              >
                C
              </Button>
              <Button
                onClick={handleBackspace}
                variant="secondary"
                className="h-12 text-base font-semibold"
              >
                <Delete className="w-4 h-4" />
              </Button>
            </div>

            {/* Number and Operation Buttons */}
            {buttons.map((row, i) => (
              <div key={i} className="grid grid-cols-4 gap-2 mb-2">
                {row.map((btn) => (
                  <Button
                    key={btn}
                    onClick={() => {
                      if (btn === "=") handleEquals();
                      else if (["+", "-", "×", "÷"].includes(btn)) handleOperation(btn);
                      else if (btn === ".") handleDecimal();
                      else handleNumber(btn);
                    }}
                    variant={["+", "-", "×", "÷"].includes(btn) ? "default" : btn === "=" ? "default" : "secondary"}
                    className="h-12 text-lg font-semibold"
                  >
                    {btn}
                  </Button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}