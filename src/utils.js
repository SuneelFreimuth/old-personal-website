/* 
 * Helper function that, used like "await waitPromise(millis)" in an async
 * function, will sleep the execution of the function for a specified number of
 * milliseconds.
 */
export function waitPromise(time) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, time);
  });
}

/* 
 * Get the last element of an array.
 */
export function lastOf(array) {
  return array[array.length - 1];
}

/* 
 * Constrains a number x between minimum a and maximum b.
 */
export function constrain(x, a, b) {
  if (x < a) return a;
  if (x > b) return b;
  return x;
}