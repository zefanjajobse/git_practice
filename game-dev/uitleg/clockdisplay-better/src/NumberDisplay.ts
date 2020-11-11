/**
 * The NumberDisplay class represents a digital number display that can hold
 * values from zero to a given limit. The limit can be specified when creating
 * the display. The values range from zero (inclusive) to limit-1. If used,
 * for example, for the seconds on a digital clock, the limit would be 60, 
 * resulting in display values from 0 to 59. When incremented, the display 
 * automatically rolls over to zero when reaching the limit.
 * 
 * @author Michael Kölling and David J. Barnes and BugSlayer
 */
class NumberDisplay {
    private limit: number;
    private value: number;

    /**
     * Constructor for objects of class NumberDisplay.
     * 
     * @param {number} rollOverLimit the limit at which the display rolls over.
     */
    public constructor(rollOverLimit: number) {
        this.limit = rollOverLimit;
        this.value = 0;
    }

    /**
     * Return the current value.
     */
    public getValue(): number {
        return this.value;
    }

    /**
     * Set the value of the display to the new specified value. If the new
     * value is less than zero or over the limit, do nothing.
     * 
     * @param {number} replacementValue the new value
     */
    public setValue(replacementValue: number) {
        if((replacementValue >= 0) && (replacementValue < this.limit)) {
            this.value = replacementValue;
        }
    }

    /**
     * Return the display value (that is, the current value as a two-digit
     * String. If the value is less than ten, it will be padded with a leading
     * zero).
     */
    public getStringValue() : string {
        if(this.value < 10) {
            return "0" + this.value;
        }
        else {
            return "" + this.value;
        }
    }

    /**
     * Try to set the value of the display to the new specified value as a string.
     * The string value will be parsed to a number first.
     */
    public setStringValue(newValue: string) {
        this.setValue(Number(newValue));
    }

    /**
     * Increment the display value by one, rolling over to zero if the
     * limit is reached.
     */
    public increment() {
        this.value = (this.value + 1) % this.limit;
    }
}
