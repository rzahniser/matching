/**
 * The list of images, and a method to select random cards from it.
 */
define([], function() {
  var images = [
    { name: "acorn", description: "The acorn's scaly cap clings tightly around a smooth nut which tapers to a neat point." },
    { name: "apple", description: "The skin of the apple is firm and crisp and it echoes hollowly when you tap it." },
    { name: "bananas", description: "A bunch of four bananas, ripe and fragrant." },
    { name: "beetle", description: "The beetle's smooth, hard carapace flows into two long horns on its head." },
    { name: "broccoli", description: "The bumpy, rounded crown of the uncooked broccoli flexes slightly under your probing fingers." },
    { name: "butterfly", description: "The butterfly's feet clutch your fingertip. You feel its wings twitch as it adjusts its balance." },
    { name: "copper", description: "A heavy lump of copper ore with a complex shape, full of holes and smooth knobby protuberances." },
    { name: "geode", description: "One side of the geode is rough rock; the other is clustered with large faceted crystals." },
    { name: "ladybug", description: "The ladybug tickles its way along your arm. Its wings brush your skin as it takes flight." },
    { name: "leaf", description: "A fine network of veins branch out from the stem toward the pointy border of this maple leaf." },
    { name: "moth", description: "The moth has a large fuzzy body and powdery wings." },
    { name: "mushroom", description: "The mushroom has a smooth fleshy cap with gills lined up underneath like the edge of a book." },
    { name: "orange", description: "The orange has a slick, dimpled surface and a strong citrus scent." },
    { name: "pine cone", description: "The pine cone rests in your hand in its prickly way and exudes a sharp piney smell.", image: "pinecone" },
    { name: "potato", description: "The potato has a smooth, firm skin with occasional divots." },
    { name: "rose", description: "The rose is a tight swirl of soft, pliable petals, with a rich smell." },
    { name: "shell", description: "A knife-sharp edge separates the ridged outside of this shell from the incredibly smooth inside." },
    { name: "starfish", description: "Five rough and spiny arms radiate out from the center of the starfish." },
    { name: "sunflower", description: "The sunflower has a fringe of long, stiff petals around a densely packed inner array of seeds." },
    { name: "walnut", description: "The walnut's rumpled shell is as smooth and hard as polished stone." },
  ];
  /*
   * Other objects to look for:
   * peas
   * fish
   * iris
   * fern
   * seahorse
   * egg
   * honeycomb
   * bee
   */
  function shuffle(array, rand) {
    for(var i = array.length - 1; i > 0; i--) {
      var dest = rand.nextInt(i + 1);
      var tmp = array[i];
      array[i] = array[dest];
      array[dest] = tmp;
    }
    return array;
  }
  
  return {
    select: function(rand, n) {
      var shuffledImages = shuffle(images.slice(), rand).slice(0, n / 2);
      var cards = shuffledImages.concat(shuffledImages);
      return shuffle(cards, rand);
    },
  };
});