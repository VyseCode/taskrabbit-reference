import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const DB_NAME = "taskrabbit_ref";
const URI =
  process.env.MONGODB_URI || `mongodb://127.0.0.1:27017/${DB_NAME}`;

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, lowercase: true },
    password: String,
    role: { type: String, enum: ["client", "tasker"], required: true },
    location: String,
    avatarUrl: String,
  },
  { timestamps: true },
);
userSchema.index({ name: "text", location: "text" });

const profileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true },
    skills: [String],
    hourlyRate: Number,
    location: String,
    bio: String,
    availability: String,
    ratingSum: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    ratingAvg: { type: Number, default: 0 },
    completedTasks: { type: Number, default: 0 },
  },
  { timestamps: true },
);
profileSchema.index({ skills: 1, hourlyRate: 1 });
profileSchema.index({ availability: 1, ratingAvg: -1 });

const taskSchema = new mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    category: String,
    title: String,
    description: String,
    location: String,
    date: Date,
    budget: Number,
    status: String,
    acceptedOffer: { type: mongoose.Schema.Types.ObjectId, default: null },
    offersCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);
taskSchema.index({ status: 1, createdAt: -1 });
taskSchema.index({ category: 1, status: 1 });

const offerSchema = new mongoose.Schema(
  {
    task: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
    tasker: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    price: Number,
    estimatedHours: Number,
    message: String,
    status: String,
  },
  { timestamps: true },
);
offerSchema.index({ task: 1, tasker: 1 }, { unique: true });
offerSchema.index({ task: 1, status: 1 });
offerSchema.index({ tasker: 1, status: 1 });

const reviewSchema = new mongoose.Schema(
  {
    task: { type: mongoose.Schema.Types.ObjectId, ref: "Task", unique: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    tasker: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rating: Number,
    comment: String,
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);
const TaskerProfile = mongoose.model("TaskerProfile", profileSchema);
const Task = mongoose.model("Task", taskSchema);
const Offer = mongoose.model("Offer", offerSchema);
const Review = mongoose.model("Review", reviewSchema);

const day = 24 * 60 * 60 * 1000;
const inDays = (n) => new Date(Date.now() + n * day);

const people = [
  { key: "priya", name: "Priya Sharma", email: "priya@example.com", role: "client", location: "Austin, TX" },
  { key: "marcus", name: "Marcus Lee", email: "marcus@example.com", role: "client", location: "Denver, CO" },
  { key: "sofia", name: "Sofia Rodriguez", email: "sofia@example.com", role: "client", location: "Austin, TX" },
  { key: "daniel", name: "Daniel Kim", email: "daniel@example.com", role: "tasker", location: "Austin, TX" },
  { key: "emma", name: "Emma Wilson", email: "emma@example.com", role: "tasker", location: "Austin, TX" },
  { key: "oliver", name: "Oliver Brown", email: "oliver@example.com", role: "tasker", location: "Denver, CO" },
  { key: "ava", name: "Ava Patel", email: "ava@example.com", role: "tasker", location: "Austin, TX" },
];

const profiles = {
  daniel: {
    skills: ["Handyman", "Painting", "Cleaning", "Electrical"],
    hourlyRate: 32,
    location: "Austin, TX",
    bio: "Detail-oriented handyman. Furniture assembly, repairs and fresh paint.",
    availability: "available",
  },
  emma: {
    skills: ["Cleaning", "Pet Care", "Tutoring"],
    hourlyRate: 28,
    location: "Austin, TX",
    bio: "Reliable cleaner, dog walker and patient tutor. Same-day availability.",
    availability: "available",
  },
  oliver: {
    skills: ["Moving", "Plumbing", "Electrical", "Handyman"],
    hourlyRate: 45,
    location: "Denver, CO",
    bio: "Licensed tradesperson for moves, leaks and electrical work.",
    availability: "available",
  },
  ava: {
    skills: ["Gardening", "Cleaning", "Delivery"],
    hourlyRate: 24,
    location: "Austin, TX",
    bio: "Garden care, deep cleans and quick local deliveries.",
    availability: "busy",
  },
};

const tasks = [
  { key: "t1", client: "priya", category: "cleaning", title: "Deep clean my apartment", description: "Two-bedroom apartment needs a thorough deep clean including kitchen and bathrooms.", location: "Austin, TX", date: inDays(4), budget: 120, status: "open" },
  { key: "t2", client: "marcus", category: "moving", title: "Help moving a 2BR apartment", description: "Need two people to load and unload a truck. Furniture is already packed.", location: "Denver, CO", date: inDays(6), budget: 200, status: "open" },
  { key: "t3", client: "sofia", category: "handyman", title: "Fix leaky kitchen faucet", description: "Kitchen faucet has a steady drip. Need someone comfortable with basic plumbing.", location: "Austin, TX", date: inDays(3), budget: 90, status: "assigned" },
  { key: "t4", client: "priya", category: "painting", title: "Paint a bedroom", description: "One bedroom, walls only. Paint and supplies will be provided.", location: "Austin, TX", date: inDays(8), budget: 300, status: "in_progress" },
  { key: "t5", client: "marcus", category: "cleaning", title: "Office cleaning", description: "Weekly office clean for a small team. Finished last week.", location: "Denver, CO", date: inDays(-4), budget: 150, status: "completed" },
  { key: "t6", client: "sofia", category: "gardening", title: "Lawn mowing and trimming", description: "Mow front and back lawn, trim hedges. Completed last weekend.", location: "Austin, TX", date: inDays(-9), budget: 60, status: "completed" },
  { key: "t7", client: "priya", category: "delivery", title: "Pick up second-hand furniture", description: "Pick up a bookshelf across town. Seller cancelled, task no longer needed.", location: "Austin, TX", date: inDays(2), budget: 40, status: "cancelled" },
  { key: "t8", client: "daniel", category: "electrical", title: "Install a ceiling fan", description: "Replace an existing light fixture with a ceiling fan in the living room.", location: "Austin, TX", date: inDays(5), budget: 110, status: "open" },
  { key: "t9", client: "sofia", category: "tutoring", title: "Algebra tutoring session", description: "Two-hour algebra refresher before an exam. Completed recently.", location: "Austin, TX", date: inDays(-2), budget: 50, status: "completed" },
];

const offers = [
  { task: "t1", tasker: "daniel", price: 100, estimatedHours: 3, message: "Happy to deep clean on short notice.", status: "pending" },
  { task: "t1", tasker: "emma", price: 110, estimatedHours: 2.5, message: "I bring my own supplies.", status: "pending" },
  { task: "t1", tasker: "ava", price: 95, estimatedHours: 4, message: "Available, but had to withdraw.", status: "withdrawn" },
  { task: "t2", tasker: "oliver", price: 180, estimatedHours: 4, message: "I have a van and can bring a helper.", status: "pending" },
  { task: "t2", tasker: "daniel", price: 170, estimatedHours: 5, message: "Can help with the move.", status: "rejected" },
  { task: "t3", tasker: "oliver", price: 85, estimatedHours: 2, message: "I can replace the faucet cartridge.", status: "accepted" },
  { task: "t3", tasker: "daniel", price: 95, estimatedHours: 2, message: "Plumbing is one of my specialties.", status: "rejected" },
  { task: "t4", tasker: "daniel", price: 280, estimatedHours: 6, message: "Painting bedrooms is my specialty.", status: "accepted" },
  { task: "t5", tasker: "emma", price: 140, estimatedHours: 4, message: "Office cleaned to spec.", status: "accepted" },
  { task: "t6", tasker: "ava", price: 55, estimatedHours: 2, message: "Mowed and trimmed the hedges.", status: "accepted" },
  { task: "t8", tasker: "emma", price: 100, estimatedHours: 2, message: "I can install the fan safely.", status: "pending" },
  { task: "t9", tasker: "emma", price: 45, estimatedHours: 2, message: "Patient, clear algebra tutoring.", status: "accepted" },
];

const reviews = [
  { task: "t5", tasker: "emma", rating: 5, comment: "Thorough and on time. The office looks great." },
  { task: "t6", tasker: "ava", rating: 4, comment: "Friendly work and a tidy finish." },
  { task: "t9", tasker: "emma", rating: 4, comment: "Explained concepts clearly. Very helpful." },
];

async function main() {
  await mongoose.connect(URI);
  if (mongoose.connection.name !== DB_NAME) {
    throw new Error(`Refusing to wipe unexpected database: ${mongoose.connection.name}`);
  }
  await mongoose.connection.db.dropDatabase();

  await Promise.all([
    User.createIndexes(),
    TaskerProfile.createIndexes(),
    Task.createIndexes(),
    Offer.createIndexes(),
    Review.createIndexes(),
  ]);

  const password = await bcrypt.hash("password123", 12);
  const insertedUsers = await User.create(
    people.map((person) => ({
      name: person.name,
      email: person.email,
      role: person.role,
      location: person.location,
      password,
    })),
  );
  const usersById = Object.fromEntries(
    people.map((person, index) => [person.key, insertedUsers[index]]),
  );
  const byEmail = Object.fromEntries(
    insertedUsers.map((user) => [user.email, user._id.toString()]),
  );

  await TaskerProfile.create(
    Object.entries(profiles).map(([key, profile]) => ({
      ...profile,
      user: usersById[key]._id,
      ratingSum: key === "emma" ? 9 : key === "ava" ? 4 : 0,
      ratingCount: key === "emma" ? 2 : key === "ava" ? 1 : 0,
      ratingAvg: key === "emma" ? 4.5 : key === "ava" ? 4 : 0,
      completedTasks: key === "emma" ? 2 : key === "ava" ? 1 : 0,
    })),
  );

  const insertedTasks = await Task.create(
    tasks.map((task) => ({
      category: task.category,
      title: task.title,
      description: task.description,
      location: task.location,
      date: task.date,
      budget: task.budget,
      status: task.status,
      client: usersById[task.client]._id,
    })),
  );
  const tasksByKey = Object.fromEntries(
    tasks.map((task, index) => [task.key, insertedTasks[index]]),
  );

  const insertedOffers = await Offer.create(
    offers.map((offer) => ({
      ...offer,
      task: tasksByKey[offer.task]._id,
      tasker: usersById[offer.tasker]._id,
    })),
  );
  const offerByKey = (taskKey, taskerKey) =>
    insertedOffers.find(
      (offer) =>
        offer.task.equals(tasksByKey[taskKey]._id) &&
        offer.tasker.equals(usersById[taskerKey]._id),
    );

  const accepted = [
    ["t3", "oliver"],
    ["t4", "daniel"],
    ["t5", "emma"],
    ["t6", "ava"],
    ["t9", "emma"],
  ];
  for (const [taskKey, taskerKey] of accepted) {
    await Task.updateOne(
      { _id: tasksByKey[taskKey]._id },
      { $set: { acceptedOffer: offerByKey(taskKey, taskerKey)._id } },
    );
  }
  for (const task of insertedTasks) {
    const count = insertedOffers.filter((offer) =>
      offer.task.equals(task._id),
    ).length;
    await Task.updateOne({ _id: task._id }, { $set: { offersCount: count } });
  }

  await Review.create(
    reviews.map((review) => ({
      ...review,
      task: tasksByKey[review.task]._id,
      client: tasksByKey[review.task].client,
      tasker: usersById[review.tasker]._id,
    })),
  );

  console.log(
    `Seeded ${insertedUsers.length} users, 4 tasker profiles, ${insertedTasks.length} tasks, ${insertedOffers.length} offers, ${reviews.length} reviews.`,
  );
  console.log(
    `Demo logins (password123): ${Object.entries(byEmail).map(([name, email]) => `${name}=${email}`).join(", ")}`,
  );
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
