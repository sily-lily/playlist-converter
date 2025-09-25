const index = 1; // 0 based indexing
const page = 2;
// const formula = ((((index * page + (5 - index)) - (5 - index)) + page) - (4 - index));
// const formula = index * page + (5 - index % 2 !== 0 ? (index + 1) : index);
const formula = index + 4;
console.log(formula);
