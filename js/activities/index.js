// js/activities/index.js
import { renderChocolateActivity, initChocolateActivity } from './chocolates.js';
import { renderRadioActivity, initRadioActivity } from "./radio.js";
import { renderCardActivity, initCardActivity } from "./card.js";
import { renderBookActivity, initBookActivity } from "./book.js";

const stub = (title) => ({
  title,
  render: () => `
    <p><strong>${title} activity</strong> goes here.</p>
    <div class="placeholder">Stub: details later.</div>
  `,
  init: () => {}
});

export const ACTIVITIES = {
  
  book: {
    title: 'Almanac',
    render: renderBookActivity,
    init: initBookActivity
  },
  bouquet: stub('Bouquet'),
  chocolates: {
    title: 'Chocolate Box',
    render: renderChocolateActivity,
    init: initChocolateActivity
  },
  card:  {
    title: "Valentines Card",
    render: renderCardActivity,
    init: initCardActivity
  },
  radio: {
    title: "Radio",
    render: renderRadioActivity,
    init: initRadioActivity
  }
};
