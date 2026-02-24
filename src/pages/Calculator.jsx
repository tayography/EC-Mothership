import React, { useState } from "react";
import { Calculator as CalcIcon, Delete } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageTransition from "../components/layout/PageTransition";

export default function Calculator() {
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
    <PageTransition>
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/30">
            <CalcIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">Calculator</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Quick calculations</p>
          </div>
        </div>

        <div className="bg-white/30 dark:bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden card-3d">
          {/* Display */}
          <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 p-8 border-b border-white/10">
            <div className="text-right">
              {operation && previousValue !== null && (
                <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">
                  {previousValue} {operation}
                </div>
              )}
              <div className="text-4xl font-semibold text-zinc-900 dark:text-white break-all">
                {display}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="p-4">
            {/* Clear and Backspace */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              <Button
                onClick={handleClear}
                variant="destructive"
                className="h-14 text-lg font-semibold"
              >
                C
              </Button>
              <Button
                onClick={handleBackspace}
                variant="secondary"
                className="h-14 text-lg font-semibold"
              >
                <Delete className="w-5 h-5" />
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
                    className={`h-14 text-xl font-semibold ${
                      btn === "0" ? "col-span-1" : ""
                    }`}
                  >
                    {btn}
                  </Button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}