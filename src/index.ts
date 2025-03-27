import alfy from "alfy";

const items = alfy.input.split(" ").map((item) => ({
  title: item,
  subtitle: "Subtitle",
}));

alfy.output(items);
