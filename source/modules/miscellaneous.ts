export function wait(seconds: number, callback: () => any) {
    setTimeout(callback, seconds * 1000);
}

export function removeDuplicates(input: string): string {
  for (let index = 1; index <= input.length / 2; index++) {
    if (input.length % index === 0) {
      const subbed = input.slice(0, index);
      if (subbed.repeat(input.length / index) === input) return subbed;
    }
  }

  return input;
}