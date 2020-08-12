export function waitPromise(time) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, time);
  });
}

export function lastOf(array) {
  return array[array.length - 1];
}

export function constrain(x, a, b) {
  if (x < a) return a;
  if (x > b) return b;
  return x;
}

export function count(pred: Function, iter: any) {
	let c = 0;
	for (let item of iter) {
		if (pred(item)) c++;
	}
	return c;
}

export function any(pred, iter) {
	for (let item of iter) {
		if (pred(item)) return true;
	}
	return false;
}

export function bothOrNeither(bool0, bool1) {
	return (bool0 && bool1) || (!bool0 && !bool1);
}

export function xor(bool0, bool1) {
	return !bothOrNeither(bool0, bool1)
}

export function* range(a: number, b: number | undefined = undefined) {
	if (b === undefined) {
		for (let i = 0; i < a; i++)
			yield i
	}
	else {
		for (let i = a; i < b; i++)
			yield i
	}
}

export function* range2(rMax: number, cMax: number): any {
	for (let r = 0; r < rMax; r++) {
		for (let c = 0; c < cMax; c++) {
			yield [r, c];
		}
	}
}
