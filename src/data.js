/* ============================================================
   Excelerate — mock data and inspect notes
   All content is invented placeholder data. No backend.
   ============================================================ */

const SUBJECTS = [
  {
    id: "cs",
    code: "9618",
    name: "Computer Science",
    topics: [
      {
        id: "cs-programming",
        name: "Programming",
        description: "Writing and testing pseudocode: selection, iteration, functions and procedures.",
        questionCount: 46,
        done: 18
      },
      {
        id: "cs-algorithms",
        name: "Algorithm design and problem-solving",
        description: "Turning a problem into steps, then checking the steps work.",
        questionCount: 34,
        done: 9
      },
      {
        id: "cs-structures",
        name: "Data types and structures",
        description: "Choosing the right way to hold data: arrays, records, stacks and queues.",
        questionCount: 28,
        done: 12
      },
      {
        id: "cs-databases",
        name: "Databases",
        description: "Relational tables, keys and queries.",
        questionCount: 22,
        done: 4
      },
      {
        id: "cs-architecture",
        name: "Computer architecture",
        description: "The processor, registers, memory and the fetch–execute cycle.",
        questionCount: 26,
        done: 7
      },
      {
        id: "cs-representation",
        name: "Data representation",
        description: "Binary, hexadecimal, images, sound and compression.",
        questionCount: 30,
        done: 15
      },
      {
        id: "cs-boolean",
        name: "Boolean logic",
        description: "Logic gates, truth tables and simplifying Boolean expressions.",
        questionCount: 24,
        done: 5
      }
    ]
  },
  {
    id: "physics",
    code: "9702",
    name: "Physics",
    topics: [
      {
        id: "phy-kinematics",
        name: "Kinematics",
        description: "Motion in a straight line: displacement, velocity, acceleration and graphs.",
        questionCount: 38,
        done: 14
      },
      {
        id: "phy-dynamics",
        name: "Dynamics",
        description: "Forces, Newton's laws, momentum and terminal velocity.",
        questionCount: 32,
        done: 11
      },
      {
        id: "phy-energy",
        name: "Work, energy and power",
        description: "Energy transfers, springs, efficiency and power.",
        questionCount: 28,
        done: 6
      },
      {
        id: "phy-waves",
        name: "Waves",
        description: "Wave properties, superposition, stationary waves and diffraction.",
        questionCount: 34,
        done: 8
      },
      {
        id: "phy-electricity",
        name: "Electricity",
        description: "Current, potential difference, resistance and D.C. circuits.",
        questionCount: 30,
        done: 10
      },
      {
        id: "phy-particles",
        name: "Particle physics",
        description: "Quarks, leptons and the particles that make up matter.",
        questionCount: 18,
        done: 3
      }
    ]
  }
];

/* Questions are short invented examples in the style of CAIE papers.
   Real paper text is never copied. */
const QUESTIONS = [
  {
    id: "phy-kin-1",
    subjectId: "physics",
    topicId: "phy-kinematics",
    kind: "past",
    source: "9702 Paper 2, 2023",
    year: 2023,
    paper: 2,
    marks: 4,
    difficulty: "Medium",
    stem: "A ball is released from rest and falls freely for 1.8 s. Calculate its speed just before it lands and the height it has fallen. Assume air resistance is negligible.",
    diagram: null,
    attempted: true,
    awarded: 3,
    markScheme: [
      { point: "Uses v = u + at with u = 0", earned: true },
      { point: "v = 17.7 m s⁻¹", earned: true },
      { point: "Uses s = ut + ½at²", earned: true },
      { point: "s = 15.9 m", earned: false }
    ],
    feedback: "Your speed is correct. For the height, substitute u = 0 and a = 9.81 m s⁻² into s = ut + ½at², then check the unit.",
    workedSteps: [
      "Start with the quantities: u = 0, a = 9.81 m s⁻², t = 1.8 s.",
      "Use v = u + at to find the speed just before landing.",
      "Use s = ut + ½at² to find the height.",
      "Final line: v = 17.7 m s⁻¹ and s = 15.9 m."
    ]
  },
  {
    id: "phy-kin-2",
    subjectId: "physics",
    topicId: "phy-kinematics",
    kind: "practice",
    source: "Practice question",
    year: null,
    paper: null,
    marks: 4,
    difficulty: "Medium",
    stem: "A cyclist accelerates uniformly from 4.0 m s⁻¹ to 9.0 m s⁻¹ while travelling 25 m. Determine the acceleration and the time taken.",
    diagram: null,
    attempted: false,
    awarded: null,
    markScheme: [
      { point: "Uses v² = u² + 2as", earned: true },
      { point: "a = 1.3 m s⁻²", earned: true },
      { point: "Uses v = u + at", earned: true },
      { point: "t = 3.8 s", earned: true }
    ],
    feedback: "Both values follow from the same three quantities. Show the equation before substituting so the method mark is visible."
  },
  {
    id: "phy-dyn-1",
    subjectId: "physics",
    topicId: "phy-dynamics",
    kind: "past",
    source: "9702 Paper 2, 2022",
    year: 2022,
    paper: 2,
    marks: 4,
    difficulty: "Hard",
    stem: "State Newton's second law. Use it to explain why the acceleration of a falling object decreases as its speed increases.",
    diagram: null,
    attempted: false,
    awarded: null,
    markScheme: [
      { point: "States F = ma", earned: true },
      { point: "Explains that drag increases with speed", earned: true },
      { point: "Explains that the resultant force decreases", earned: true },
      { point: "Links decreasing resultant force to decreasing acceleration", earned: false }
    ],
    feedback: "The law is correct. The last mark needs the chain: drag increases, resultant force falls, so acceleration falls.",
    workedSteps: [
      "State Newton's second law: F = ma.",
      "As speed rises, drag increases.",
      "The resultant force is weight minus drag, so it falls.",
      "A smaller resultant force gives a smaller acceleration.",
      "Final line: acceleration decreases as speed increases."
    ]
  },
  {
    id: "phy-dyn-2",
    subjectId: "physics",
    topicId: "phy-dynamics",
    kind: "practice",
    source: "Practice question",
    year: null,
    paper: null,
    marks: 3,
    difficulty: "Easy",
    stem: "A crate of mass 24 kg is pulled across a rough horizontal floor by a horizontal force of 90 N. The frictional force is 35 N. Calculate the acceleration of the crate.",
    diagram: null,
    attempted: false,
    awarded: null,
    markScheme: [
      { point: "Finds the resultant force: 90 − 35 = 55 N", earned: true },
      { point: "Uses a = F / m", earned: true },
      { point: "a = 2.3 m s⁻²", earned: true }
    ],
    feedback: "Subtract friction before dividing. The result is positive, so the crate accelerates in the direction of the pull."
  },
  {
    id: "phy-dyn-3",
    subjectId: "physics",
    topicId: "phy-dynamics",
    kind: "past",
    source: "9702 Paper 2, 2024",
    year: 2024,
    paper: 2,
    marks: 4,
    difficulty: "Medium",
    stem: "A block of mass 4.0 kg slides down a rough plane inclined at 25° to the horizontal. The frictional force acting on the block is 6.0 N. Calculate the acceleration of the block along the plane.",
    diagram: null,
    attempted: false,
    awarded: null,
    markScheme: [
      { point: "Resolves the weight along the slope: 4.0 × 9.81 × sin 25° (= 16.6 N)", earned: true },
      { point: "Subtracts friction: 16.6 − 6.0 = 10.6 N", earned: true },
      { point: "Uses a = F / m", earned: true },
      { point: "a = 2.6 m s⁻²", earned: true }
    ],
    feedback: "Resolve the weight on the slope first, subtract friction to get the resultant, then divide by the mass.",
    workedSteps: [
      "Resolve the weight parallel to the slope: W∥ = mg sin 25°.",
      "W∥ = 4.0 × 9.81 × sin 25° = 16.6 N.",
      "Subtract friction: 16.6 − 6.0 = 10.6 N down the slope.",
      "Use a = F / m = 10.6 / 4.0.",
      "Final line: a = 2.6 m s⁻² down the slope."
    ]
  },
  {
    id: "phy-energy-1",
    subjectId: "physics",
    topicId: "phy-energy",
    kind: "past",
    source: "9702 Paper 2, 2023",
    year: 2023,
    paper: 2,
    marks: 2,
    difficulty: "Easy",
    stem: "A spring of spring constant 180 N m⁻¹ is compressed by 0.12 m. Calculate the elastic potential energy stored in the spring.",
    diagram: null,
    attempted: false,
    awarded: null,
    markScheme: [
      { point: "Uses E = ½kx²", earned: true },
      { point: "E = 1.3 J", earned: true }
    ],
    feedback: "Square the extension before multiplying. The unit is joules because the spring constant is in N m⁻¹."
  },
  {
    id: "phy-energy-2",
    subjectId: "physics",
    topicId: "phy-energy",
    kind: "practice",
    source: "Practice question",
    year: null,
    paper: null,
    marks: 4,
    difficulty: "Medium",
    stem: "A pump raises 0.25 m³ of water through a vertical height of 12 m every minute. Calculate the useful output power of the pump. Density of water = 1000 kg m⁻³.",
    diagram: null,
    attempted: false,
    awarded: null,
    markScheme: [
      { point: "Uses m = ρV", earned: true },
      { point: "Uses ΔE = mgΔh", earned: true },
      { point: "Uses P = E / t with t = 60 s", earned: true },
      { point: "P = 490 W", earned: true }
    ],
    feedback: "Convert the rate to one minute before dividing. Keep the mass, energy and power steps visible."
  },
  {
    id: "phy-waves-1",
    subjectId: "physics",
    topicId: "phy-waves",
    kind: "past",
    source: "9702 Paper 2, 2024",
    year: 2024,
    paper: 2,
    marks: 4,
    difficulty: "Medium",
    stem: "State the principle of superposition and describe how two progressive waves produce a stationary wave.",
    diagram: null,
    attempted: true,
    awarded: 3,
    markScheme: [
      { point: "States that displacements add when waves meet", earned: true },
      { point: "States that the waves must have the same frequency and opposite directions", earned: true },
      { point: "Explains nodes form where the waves are in antiphase", earned: true },
      { point: "Explains antinodes form where the waves are in phase", earned: false }
    ],
    feedback: "The node explanation is there. Add the antinode case: displacements add to a maximum, so the point oscillates with maximum amplitude."
  },
  {
    id: "phy-waves-2",
    subjectId: "physics",
    topicId: "phy-waves",
    kind: "practice",
    source: "Practice question",
    year: null,
    paper: null,
    marks: 3,
    difficulty: "Medium",
    stem: "A diffraction grating has 600 lines per mm. Light of wavelength 590 nm is incident normally on the grating. Calculate the angle of the second-order maximum.",
    diagram: null,
    attempted: false,
    awarded: null,
    markScheme: [
      { point: "Uses d sin θ = nλ", earned: true },
      { point: "d = 1.67 × 10⁻⁶ m", earned: true },
      { point: "θ = 45°", earned: true }
    ],
    feedback: "Convert lines per mm to a line spacing in metres first. Keep the wavelength in metres too."
  },
  {
    id: "phy-elec-1",
    subjectId: "physics",
    topicId: "phy-electricity",
    kind: "past",
    source: "9702 Paper 2, 2023",
    year: 2023,
    paper: 2,
    marks: 3,
    difficulty: "Medium",
    stem: "State Kirchhoff's second law and explain how it follows from conservation of energy.",
    diagram: null,
    attempted: true,
    awarded: 2,
    markScheme: [
      { point: "States that the sum of e.m.f.s equals the sum of p.d.s around a loop", earned: true },
      { point: "Links the law to energy transferred per unit charge", earned: true },
      { point: "Explains that energy is conserved around the loop", earned: false }
    ],
    feedback: "The statement is right. The final mark needs the link: charge carries energy around the loop, and no energy is lost overall."
  },
  {
    id: "phy-elec-2",
    subjectId: "physics",
    topicId: "phy-electricity",
    kind: "practice",
    source: "Practice question",
    year: null,
    paper: null,
    marks: 3,
    difficulty: "Easy",
    stem: "A battery of e.m.f. 12 V and negligible internal resistance is connected to resistors of 18 Ω and 36 Ω in parallel. Calculate the total current from the battery.",
    diagram: null,
    attempted: false,
    awarded: null,
    markScheme: [
      { point: "Uses 1/R = 1/18 + 1/36", earned: true },
      { point: "R = 12 Ω", earned: true },
      { point: "I = 1.0 A", earned: true }
    ],
    feedback: "Find the combined resistance before using I = V / R. A quick check: the current is larger than through either resistor alone."
  },
  {
    id: "phy-part-1",
    subjectId: "physics",
    topicId: "phy-particles",
    kind: "past",
    source: "9702 Paper 2, 2022",
    year: 2022,
    paper: 2,
    marks: 3,
    difficulty: "Easy",
    stem: "State the quark composition of a proton and of a neutron. Use the quark charges to explain the charge of each particle.",
    diagram: null,
    attempted: false,
    awarded: null,
    markScheme: [
      { point: "Proton: uud", earned: true },
      { point: "Neutron: udd", earned: true },
      { point: "Explains charge using +⅔e and −⅓e", earned: true }
    ],
    feedback: "Write the composition first, then add the charges. A proton gives +⅔ + ⅔ − ⅓ = +1e."
  },
  {
    id: "phy-part-2",
    subjectId: "physics",
    topicId: "phy-particles",
    kind: "practice",
    source: "Practice question",
    year: null,
    paper: null,
    marks: 2,
    difficulty: "Easy",
    stem: "A particle is made of one quark and one antiquark. State the name of this class of particle and give one example.",
    diagram: null,
    attempted: false,
    awarded: null,
    markScheme: [
      { point: "Meson", earned: true },
      { point: "A valid example, e.g. pion or kaon", earned: true }
    ],
    feedback: "One quark plus one antiquark is a meson. Baryons, such as protons, are made of three quarks."
  },
  {
    id: "cs-prog-1",
    subjectId: "cs",
    topicId: "cs-programming",
    kind: "past",
    source: "9618 Paper 2, 2023",
    year: 2023,
    paper: 2,
    marks: 5,
    difficulty: "Medium",
    stem: "Write pseudocode for a procedure that inputs 10 integers and outputs the largest and smallest values.",
    diagram: null,
    attempted: true,
    awarded: 4,
    markScheme: [
      { point: "Initialises largest and smallest from the first input", earned: true },
      { point: "Loops exactly 10 times", earned: true },
      { point: "Updates largest when a value is greater", earned: true },
      { point: "Updates smallest when a value is smaller", earned: true },
      { point: "Outputs both values", earned: false }
    ],
    feedback: "The comparison logic is sound. The procedure must output both results, not just store them.",
    workedSteps: [
      "Declare an array of 10 integers and variables for largest and smallest.",
      "Read the first value into the array and set largest and smallest to it.",
      "Loop from the second value to the tenth.",
      "Replace largest when the value is greater; replace smallest when it is smaller.",
      "Final line: OUTPUT largest and OUTPUT smallest after the loop."
    ]
  },
  {
    id: "cs-prog-2",
    subjectId: "cs",
    topicId: "cs-programming",
    kind: "practice",
    source: "Practice question",
    year: null,
    paper: null,
    marks: 4,
    difficulty: "Easy",
    stem: "Write pseudocode for a function that takes a string and returns the same string with every space removed.",
    diagram: null,
    attempted: false,
    awarded: null,
    markScheme: [
      { point: "Defines a function with a string parameter and return type", earned: true },
      { point: "Loops through each character", earned: true },
      { point: "Builds a new string without spaces", earned: true },
      { point: "Returns the new string", earned: true }
    ],
    feedback: "Build the result one character at a time. A function needs a RETURN statement, not an OUTPUT statement."
  },
  {
    id: "cs-alg-1",
    subjectId: "cs",
    topicId: "cs-algorithms",
    kind: "past",
    source: "9618 Paper 2, 2022",
    year: 2022,
    paper: 2,
    marks: 5,
    difficulty: "Medium",
    stem: "Draw a flowchart for an algorithm that inputs three different numbers and outputs the largest.",
    diagram: "flowchart",
    attempted: false,
    awarded: null,
    markScheme: [
      { point: "Inputs three values", earned: true },
      { point: "Compares the first two values", earned: true },
      { point: "Compares the larger value with the third", earned: true },
      { point: "Outputs the largest value", earned: true },
      { point: "Uses correct symbols and flowlines", earned: false }
    ],
    feedback: "Two comparisons are enough. Check that every path reaches the output and that the decision symbols have labelled branches."
  },
  {
    id: "cs-alg-2",
    subjectId: "cs",
    topicId: "cs-algorithms",
    kind: "practice",
    source: "Practice question",
    year: null,
    paper: null,
    marks: 4,
    difficulty: "Medium",
    stem: "A program stores 20 temperature readings in an array. Describe an algorithm to count how many readings are above the mean.",
    diagram: null,
    attempted: false,
    awarded: null,
    markScheme: [
      { point: "Calculates the mean of all 20 readings", earned: true },
      { point: "Loops through every element", earned: true },
      { point: "Compares each value with the mean", earned: true },
      { point: "Increments a counter when the value is greater", earned: true }
    ],
    feedback: "Two passes are needed: one to find the mean, one to count. State both loops clearly."
  },
  {
    id: "cs-ds-1",
    subjectId: "cs",
    topicId: "cs-structures",
    kind: "past",
    source: "9618 Paper 2, 2023",
    year: 2023,
    paper: 2,
    marks: 3,
    difficulty: "Easy",
    stem: "Explain the difference between a 1D array and a 2D array. Give one example use of each.",
    diagram: null,
    attempted: false,
    awarded: null,
    markScheme: [
      { point: "1D array is a single list; 2D array is a table", earned: true },
      { point: "Gives a valid example of a 1D array", earned: true },
      { point: "Gives a valid example of a 2D array", earned: true }
    ],
    feedback: "Use the indices in your answer: one index for a list, two for a table."
  },
  {
    id: "cs-ds-2",
    subjectId: "cs",
    topicId: "cs-structures",
    kind: "practice",
    source: "Practice question",
    year: null,
    paper: null,
    marks: 4,
    difficulty: "Medium",
    stem: "A queue is stored in a 1D array with front and rear pointers. Explain how the pointers change when an item is removed and when an item is added.",
    diagram: null,
    attempted: false,
    awarded: null,
    markScheme: [
      { point: "Front pointer moves forward on removal", earned: true },
      { point: "Rear pointer moves forward on addition", earned: true },
      { point: "Explains wrap-around or reuse of free space", earned: true },
      { point: "Explains how an empty queue is detected", earned: false }
    ],
    feedback: "Describe both pointers separately, then say what happens at the end of the array."
  },
  {
    id: "cs-db-1",
    subjectId: "cs",
    topicId: "cs-databases",
    kind: "past",
    source: "9618 Paper 2, 2022",
    year: 2022,
    paper: 2,
    marks: 3,
    difficulty: "Easy",
    stem: "State what is meant by a primary key and explain why a table needs one.",
    diagram: null,
    attempted: false,
    awarded: null,
    markScheme: [
      { point: "States a field that uniquely identifies a record", earned: true },
      { point: "Explains that it prevents duplicate records", earned: true },
      { point: "Explains that it can link to another table", earned: true }
    ],
    feedback: "The key idea is uniqueness. Add that other tables can refer to it as a foreign key.",
    workedSteps: [
      "A primary key is a field that uniquely identifies each record.",
      "It cannot repeat and it cannot be empty.",
      "It prevents duplicate records in the table.",
      "Other tables can refer to it with a foreign key.",
      "Final line: a primary key gives every row a unique identity and links tables together."
    ]
  },
  {
    id: "cs-db-2",
    subjectId: "cs",
    topicId: "cs-databases",
    kind: "practice",
    source: "Practice question",
    year: null,
    paper: null,
    marks: 4,
    difficulty: "Medium",
    stem: "Describe two ways a relational database reduces duplicated data compared with a flat file.",
    diagram: null,
    attempted: false,
    awarded: null,
    markScheme: [
      { point: "Stores repeated data once in a separate table", earned: true },
      { point: "Links tables using a key", earned: true },
      { point: "Updates only need to happen in one place", earned: true },
      { point: "Gives a concrete example", earned: true }
    ],
    feedback: "Name the repeated data, the separate table and the key that joins them."
  },
  {
    id: "cs-arch-1",
    subjectId: "cs",
    topicId: "cs-architecture",
    kind: "past",
    source: "9618 Paper 2, 2023",
    year: 2023,
    paper: 2,
    marks: 4,
    difficulty: "Medium",
    stem: "Describe the role of the program counter and the memory address register during the fetch–execute cycle.",
    diagram: null,
    attempted: true,
    awarded: 2,
    markScheme: [
      { point: "PC holds the address of the next instruction", earned: true },
      { point: "MAR holds the address being accessed", earned: true },
      { point: "PC is incremented during fetch", earned: false },
      { point: "Instruction is fetched into the MDR", earned: false }
    ],
    feedback: "Both roles are correct. Add what happens next: the PC increments and the instruction arrives in the MDR."
  },
  {
    id: "cs-arch-2",
    subjectId: "cs",
    topicId: "cs-architecture",
    kind: "practice",
    source: "Practice question",
    year: null,
    paper: null,
    marks: 3,
    difficulty: "Medium",
    stem: "Explain why a processor with a larger cache can run some programs faster.",
    diagram: null,
    attempted: false,
    awarded: null,
    markScheme: [
      { point: "Cache is faster than main memory", earned: true },
      { point: "More instructions and data are held close to the processor", earned: true },
      { point: "Fewer slow accesses to main memory", earned: true }
    ],
    feedback: "Focus on access time and locality. A larger cache means fewer trips to main memory."
  },
  {
    id: "cs-rep-1",
    subjectId: "cs",
    topicId: "cs-representation",
    kind: "past",
    source: "9618 Paper 2, 2022",
    year: 2022,
    paper: 2,
    marks: 2,
    difficulty: "Easy",
    stem: "Convert the denary number 156 to 8-bit binary and to hexadecimal.",
    diagram: null,
    attempted: false,
    awarded: null,
    markScheme: [
      { point: "10011100", earned: true },
      { point: "9C", earned: true }
    ],
    feedback: "Split the byte into two nibbles for hexadecimal: 1001 is 9 and 1100 is C."
  },
  {
    id: "cs-rep-2",
    subjectId: "cs",
    topicId: "cs-representation",
    kind: "practice",
    source: "Practice question",
    year: null,
    paper: null,
    marks: 4,
    difficulty: "Medium",
    stem: "Explain how the resolution and colour depth of a bitmap image affect its file size.",
    diagram: null,
    attempted: false,
    awarded: null,
    markScheme: [
      { point: "File size = width × height × colour depth", earned: true },
      { point: "Higher resolution means more pixels", earned: true },
      { point: "Higher colour depth means more bits per pixel", earned: true },
      { point: "Gives a numerical example", earned: true }
    ],
    feedback: "Treat the two factors separately, then combine them in the file size formula."
  },
  {
    id: "cs-bool-1",
    subjectId: "cs",
    topicId: "cs-boolean",
    kind: "past",
    source: "9618 Paper 2, 2023",
    year: 2023,
    paper: 2,
    marks: 4,
    difficulty: "Medium",
    stem: "A logic circuit has inputs A, B and C. Its output is 1 when A and B are both 1, or when C is 1. Write the Boolean expression for the circuit and complete a truth table for all eight input combinations.",
    diagram: null,
    attempted: false,
    awarded: null,
    markScheme: [
      { point: "Correct expression: (A AND B) OR C", earned: true },
      { point: "Truth table has eight input rows", earned: true },
      { point: "Output is 1 when A = 1 and B = 1", earned: true },
      { point: "Output is 1 whenever C = 1", earned: false }
    ],
    feedback: "The expression is right. Check the rows where C is 1 but A and B are not both 1: the OR means the output should still be 1."
  }
];

/* ------------------------------------------------------------
   Simple 2D figures for the question header.
   Each figure is a small list of primitive shapes on a fixed
   viewBox, drawn as inline SVG by the app. No library, no
   external images, and everything scales with the text colour.
   ------------------------------------------------------------ */

const FIGURES = {
  "phy-kin-1": {
    caption: "A ball falling freely from rest",
    width: 360,
    height: 200,
    items: [
      { t: "line", x1: 24, y1: 170, x2: 336, y2: 170 },
      { t: "line", x1: 40, y1: 170, x2: 50, y2: 180, muted: true },
      { t: "line", x1: 80, y1: 170, x2: 90, y2: 180, muted: true },
      { t: "line", x1: 120, y1: 170, x2: 130, y2: 180, muted: true },
      { t: "line", x1: 160, y1: 170, x2: 170, y2: 180, muted: true },
      { t: "line", x1: 200, y1: 170, x2: 210, y2: 180, muted: true },
      { t: "circle", cx: 180, cy: 34, r: 10 },
      { t: "line", x1: 180, y1: 46, x2: 180, y2: 168, dash: true, muted: true },
      { t: "text", x: 190, y: 112, text: "h" },
      { t: "arrow", x1: 218, y1: 58, x2: 218, y2: 104, accent: true },
      { t: "text", x: 226, y: 86, text: "a = 9.8 m s⁻²", size: 10 },
      { t: "text", x: 196, y: 26, text: "u = 0", size: 10 },
      { t: "text", x: 196, y: 150, text: "t = 1.8 s", size: 10 }
    ]
  },
  "phy-kin-2": {
    caption: "A cyclist accelerating over 25 m",
    width: 360,
    height: 200,
    items: [
      { t: "line", x1: 20, y1: 160, x2: 340, y2: 160 },
      { t: "rect", x: 55, y: 138, w: 46, h: 20 },
      { t: "circle", cx: 64, cy: 162, r: 8 },
      { t: "circle", cx: 96, cy: 162, r: 8 },
      { t: "arrow", x1: 55, y1: 118, x2: 135, y2: 118, accent: true },
      { t: "text", x: 52, y: 108, text: "u = 4.0 m s⁻¹", size: 10 },
      { t: "arrow", x1: 190, y1: 118, x2: 310, y2: 118, accent: true },
      { t: "text", x: 190, y: 108, text: "v = 9.0 m s⁻¹", size: 10 },
      { t: "dim", x1: 55, y1: 186, x2: 310, y2: 186, label: "s = 25 m" }
    ]
  },
  "phy-dyn-1": {
    caption: "Velocity–time graph for a falling object with drag",
    builder: "velocityTime",
    params: {
      terminal: 40,
      tau: 6,
      tMax: 30,
      tangentAt: 9,
      caption: "Velocity–time graph for a falling object with drag"
    }
  },
  "phy-dyn-2": {
    caption: "Forces on a crate pulled across a rough floor",
    builder: "freeBody",
    params: {
      shape: "rect",
      caption: "Forces on a crate pulled across a rough floor",
      forces: [
        { label: "90 N", angle: 0, length: 62 },
        { label: "35 N", angle: 180, length: 46 },
        { label: "N", angle: 90, length: 52 },
        { label: "W", angle: -90, length: 52 }
      ]
    }
  },
  "phy-dyn-3": {
    caption: "Block sliding down a rough plane inclined at 25°",
    builder: "inclinedPlane",
    params: {
      angle: 25,
      showForces: true,
      showComponents: true,
      weightLabel: "W = mg",
      caption: "Block sliding down a rough plane inclined at 25°"
    }
  },
  "phy-energy-1": {
    caption: "A spring compressed by 0.12 m",
    width: 360,
    height: 200,
    items: [
      { t: "line", x1: 40, y1: 36, x2: 40, y2: 164 },
      { t: "line", x1: 40, y1: 50, x2: 30, y2: 58, muted: true },
      { t: "line", x1: 40, y1: 80, x2: 30, y2: 88, muted: true },
      { t: "line", x1: 40, y1: 110, x2: 30, y2: 118, muted: true },
      { t: "line", x1: 40, y1: 140, x2: 30, y2: 148, muted: true },
      { t: "path", d: "M 42 100 L 55 80 L 68 120 L 81 80 L 94 120 L 107 80 L 120 120 L 133 100" },
      { t: "rect", x: 133, y: 76, w: 26, h: 48 },
      { t: "arrow", x1: 162, y1: 100, x2: 240, y2: 100, accent: true },
      { t: "text", x: 162, y: 90, text: "x = 0.12 m", size: 10 },
      { t: "text", x: 40, y: 186, text: "k = 180 N m⁻¹", size: 10 }
    ]
  },
  "phy-energy-2": {
    caption: "A pump raising water through 12 m",
    width: 360,
    height: 200,
    items: [
      { t: "line", x1: 20, y1: 172, x2: 340, y2: 172 },
      { t: "rect", x: 50, y: 140, w: 90, h: 32 },
      { t: "path", d: "M 95 140 V 58 H 236" },
      { t: "arrow", x1: 200, y1: 74, x2: 236, y2: 58, accent: true },
      { t: "dim", x1: 276, y1: 140, x2: 276, y2: 58, label: "12 m" },
      { t: "text", x: 50, y: 192, text: "0.25 m³ of water every minute", size: 10 }
    ]
  },
  "phy-waves-1": {
    caption: "Two progressive waves and their resultant",
    width: 360,
    height: 230,
    items: [
      { t: "text", x: 24, y: 16, text: "wave 1", size: 10 },
      { t: "line", x1: 20, y1: 56, x2: 340, y2: 56, muted: true },
      { t: "wave", x: 20, y: 56, width: 320, amp: 22, cycles: 4 },
      { t: "text", x: 24, y: 92, text: "wave 2 (opposite direction)", size: 10 },
      { t: "line", x1: 20, y1: 132, x2: 340, y2: 132, muted: true },
      { t: "wave", x: 20, y: 132, width: 320, amp: 22, cycles: 4, dash: true },
      { t: "text", x: 24, y: 168, text: "resultant", size: 10 },
      { t: "line", x1: 20, y1: 206, x2: 340, y2: 206, muted: true },
      { t: "wave", x: 20, y: 206, width: 320, amp: 30, cycles: 8, accent: true },
      { t: "text", x: 20, y: 226, text: "nodes where the two waves cancel, antinodes where they add", size: 9 }
    ]
  },
  "phy-waves-2": {
    caption: "Light diffracted by a grating",
    width: 360,
    height: 200,
    items: [
      { t: "line", x1: 150, y1: 20, x2: 150, y2: 180 },
      { t: "line", x1: 144, y1: 40, x2: 156, y2: 40, muted: true },
      { t: "line", x1: 144, y1: 70, x2: 156, y2: 70, muted: true },
      { t: "line", x1: 144, y1: 100, x2: 156, y2: 100, muted: true },
      { t: "line", x1: 144, y1: 130, x2: 156, y2: 130, muted: true },
      { t: "line", x1: 144, y1: 160, x2: 156, y2: 160, muted: true },
      { t: "arrow", x1: 28, y1: 100, x2: 140, y2: 100, accent: true },
      { t: "text", x: 28, y: 90, text: "λ = 590 nm", size: 10 },
      { t: "arrow", x1: 152, y1: 100, x2: 320, y2: 40, accent: true },
      { t: "arrow", x1: 152, y1: 100, x2: 320, y2: 160, accent: true },
      { t: "line", x1: 152, y1: 100, x2: 336, y2: 100, dash: true, muted: true },
      { t: "path", d: "M 200 100 Q 198 88 192 78", muted: true },
      { t: "text", x: 204, y: 88, text: "θ", size: 10 },
      { t: "text", x: 28, y: 190, text: "600 lines per mm", size: 10 }
    ]
  },
  "phy-elec-1": {
    caption: "One loop with an e.m.f. and a resistor",
    width: 360,
    height: 200,
    items: [
      { t: "line", x1: 80, y1: 40, x2: 280, y2: 40 },
      { t: "line", x1: 280, y1: 40, x2: 280, y2: 150 },
      { t: "line", x1: 80, y1: 150, x2: 160, y2: 150 },
      { t: "line", x1: 200, y1: 150, x2: 280, y2: 150 },
      { t: "line", x1: 80, y1: 150, x2: 80, y2: 40 },
      { t: "rect", x: 158, y: 34, w: 44, h: 12 },
      { t: "text", x: 180, y: 26, text: "R", size: 10, anchor: "middle" },
      { t: "line", x1: 170, y1: 138, x2: 170, y2: 162 },
      { t: "line", x1: 190, y1: 144, x2: 190, y2: 156 },
      { t: "arrow", x1: 80, y1: 120, x2: 80, y2: 70, accent: true },
      { t: "text", x: 90, y: 98, text: "I", size: 10 },
      { t: "text", x: 24, y: 186, text: "sum of e.m.f.s = sum of p.d.s around the loop", size: 10 }
    ]
  },
  "phy-elec-2": {
    caption: "Two resistors in parallel across a battery",
    width: 360,
    height: 200,
    items: [
      { t: "line", x1: 60, y1: 60, x2: 280, y2: 60 },
      { t: "line", x1: 60, y1: 160, x2: 280, y2: 160 },
      { t: "line", x1: 60, y1: 60, x2: 60, y2: 86 },
      { t: "line", x1: 60, y1: 122, x2: 60, y2: 160 },
      { t: "line", x1: 52, y1: 86, x2: 52, y2: 122 },
      { t: "line", x1: 68, y1: 96, x2: 68, y2: 112 },
      { t: "text", x: 30, y: 108, text: "12 V", size: 10 },
      { t: "line", x1: 200, y1: 60, x2: 200, y2: 96 },
      { t: "line", x1: 200, y1: 124, x2: 200, y2: 160 },
      { t: "rect", x: 186, y: 96, w: 28, h: 28 },
      { t: "text", x: 200, y: 82, text: "18 Ω", size: 10, anchor: "middle" },
      { t: "line", x1: 280, y1: 60, x2: 280, y2: 96 },
      { t: "line", x1: 280, y1: 124, x2: 280, y2: 160 },
      { t: "rect", x: 266, y: 96, w: 28, h: 28 },
      { t: "text", x: 280, y: 82, text: "36 Ω", size: 10, anchor: "middle" },
      { t: "text", x: 24, y: 190, text: "the same p.d. across both resistors", size: 10 }
    ]
  },
  "phy-part-1": {
    caption: "Quark composition of a proton and a neutron",
    width: 360,
    height: 200,
    items: [
      { t: "circle", cx: 108, cy: 84, r: 38 },
      { t: "circle", cx: 94, cy: 74, r: 10 },
      { t: "text", x: 94, y: 78, text: "u", size: 11, anchor: "middle" },
      { t: "circle", cx: 122, cy: 74, r: 10 },
      { t: "text", x: 122, y: 78, text: "u", size: 11, anchor: "middle" },
      { t: "circle", cx: 108, cy: 100, r: 10 },
      { t: "text", x: 108, y: 104, text: "d", size: 11, anchor: "middle" },
      { t: "circle", cx: 252, cy: 84, r: 38 },
      { t: "circle", cx: 238, cy: 74, r: 10 },
      { t: "text", x: 238, y: 78, text: "u", size: 11, anchor: "middle" },
      { t: "circle", cx: 266, cy: 74, r: 10 },
      { t: "text", x: 266, y: 78, text: "d", size: 11, anchor: "middle" },
      { t: "circle", cx: 252, cy: 100, r: 10 },
      { t: "text", x: 252, y: 104, text: "d", size: 11, anchor: "middle" },
      { t: "text", x: 108, y: 146, text: "proton: uud  (+1e)", size: 10, anchor: "middle" },
      { t: "text", x: 252, y: 146, text: "neutron: udd  (0)", size: 10, anchor: "middle" }
    ]
  },
  "cs-ds-2": {
    caption: "A queue in a 1D array with front and rear pointers",
    width: 360,
    height: 200,
    items: [
      { t: "rect", x: 30, y: 64, w: 44, h: 40 },
      { t: "text", x: 52, y: 90, text: "A", size: 12, anchor: "middle" },
      { t: "rect", x: 78, y: 64, w: 44, h: 40 },
      { t: "text", x: 100, y: 90, text: "B", size: 12, anchor: "middle" },
      { t: "rect", x: 126, y: 64, w: 44, h: 40 },
      { t: "text", x: 148, y: 90, text: "C", size: 12, anchor: "middle" },
      { t: "rect", x: 174, y: 64, w: 44, h: 40, muted: true },
      { t: "rect", x: 222, y: 64, w: 44, h: 40, muted: true },
      { t: "rect", x: 270, y: 64, w: 44, h: 40, muted: true },
      { t: "arrow", x1: 100, y1: 132, x2: 100, y2: 112, accent: true },
      { t: "text", x: 100, y: 148, text: "front", size: 10, anchor: "middle" },
      { t: "arrow", x1: 196, y1: 132, x2: 196, y2: 112, accent: true },
      { t: "text", x: 196, y: 148, text: "rear", size: 10, anchor: "middle" },
      { t: "text", x: 24, y: 184, text: "free space is reused from the front after removals", size: 10 }
    ]
  },
  "cs-bool-1": {
    caption: "An AND gate feeding an OR gate",
    width: 360,
    height: 200,
    items: [
      { t: "line", x1: 40, y1: 56, x2: 110, y2: 56 },
      { t: "text", x: 32, y: 60, text: "A", size: 11 },
      { t: "line", x1: 40, y1: 84, x2: 110, y2: 84 },
      { t: "text", x: 32, y: 88, text: "B", size: 11 },
      { t: "path", d: "M 110 44 V 96 H 132 A 26 26 0 0 0 132 44 Z" },
      { t: "text", x: 128, y: 74, text: "AND", size: 9, anchor: "middle" },
      { t: "line", x1: 158, y1: 70, x2: 204, y2: 70 },
      { t: "path", d: "M 204 44 Q 236 44 256 70 Q 236 96 204 96 Q 220 70 204 44 Z" },
      { t: "text", x: 228, y: 74, text: "OR", size: 9, anchor: "middle" },
      { t: "path", d: "M 40 128 H 186 V 88" },
      { t: "text", x: 32, y: 132, text: "C", size: 11 },
      { t: "line", x1: 256, y1: 70, x2: 320, y2: 70 },
      { t: "text", x: 288, y: 62, text: "output", size: 10, anchor: "middle" },
      { t: "text", x: 24, y: 180, text: "(A AND B) OR C", size: 11 }
    ]
  },
  "cs-alg-1": {
    caption: "A three-cycle flowchart for the largest of three numbers",
    width: 360,
    height: 220,
    items: [
      { t: "rect", x: 120, y: 8, w: 120, h: 26 },
      { t: "text", x: 180, y: 26, text: "START", size: 10, anchor: "middle" },
      { t: "arrow", x1: 180, y1: 34, x2: 180, y2: 50 },
      { t: "rect", x: 120, y: 50, w: 120, h: 26 },
      { t: "text", x: 180, y: 68, text: "INPUT a, b, c", size: 10, anchor: "middle" },
      { t: "arrow", x1: 180, y1: 76, x2: 180, y2: 92 },
      { t: "path", d: "M 180 92 L 250 116 L 180 140 L 110 116 Z" },
      { t: "text", x: 180, y: 120, text: "a > b ?", size: 10, anchor: "middle" },
      { t: "arrow", x1: 250, y1: 116, x2: 300, y2: 116 },
      { t: "text", x: 268, y: 108, text: "yes", size: 9 },
      { t: "text", x: 190, y: 150, text: "no", size: 9 },
      { t: "arrow", x1: 180, y1: 140, x2: 180, y2: 168 },
      { t: "rect", x: 110, y: 168, w: 140, h: 26 },
      { t: "text", x: 180, y: 186, text: "OUTPUT the largest", size: 10, anchor: "middle" }
    ]
  }
};

/* Question history for the Stats tab. Mock data: practice questions
   have no past appearances and fall back to an empty list. */
const QUESTION_HISTORY = {
  "phy-kin-1": { years: [2023, 2021, 2019, 2018], papers: [2, 2, 1, 2], frequency: 4 },
  "phy-dyn-1": { years: [2022, 2020, 2017], papers: [2, 3, 2], frequency: 3 },
  "phy-dyn-3": { years: [2024, 2022], papers: [2, 2], frequency: 2 },
  "cs-prog-1": { years: [2023, 2022, 2020], papers: [2, 2, 1], frequency: 3 },
  "cs-db-1": { years: [2022, 2019], papers: [1, 2], frequency: 2 },
  "phy-waves-1": { years: [2023, 2021], papers: [2, 2], frequency: 2 },
  "cs-alg-1": { years: [2023, 2020, 2018], papers: [1, 2, 1], frequency: 3 }
};

/* One question-level discussion thread per question. Questions with no
   entry show the empty state. New comments are appended in memory. */
const QUESTION_DISCUSSION = {
  "phy-kin-1": [
    {
      author: "Maya R.",
      text: "I keep losing the unit on the height. Does it need m or m s⁻¹?",
      time: "2 hours ago",
      replies: [
        { author: "Daniel O.", text: "Height is a distance, so m. Speed is the one in m s⁻¹.", time: "1 hour ago" }
      ]
    },
    { author: "Sofia H.", text: "The scheme also gives a mark for writing the equation before substituting.", time: "40 minutes ago" }
  ],
  "cs-prog-1": [
    { author: "Aisha K.", text: "Does the array need to be declared before the FOR loop?", time: "Yesterday" },
    { author: "Mr Patel", text: "Yes. Declare it with its bounds before you read any values into it.", time: "Yesterday" }
  ]
};

/* Guided walkthroughs: a short script of annotations drawn over the
   question figure, revealed step by step with play / pause / scrub. */
const WALKTHROUGHS = {
  "phy-kin-1": {
    title: "Falling freely: speed, then height",
    steps: [
      {
        caption: "Start with what the question gives you: u = 0, a = 9.8 m s⁻² and t = 1.8 s.",
        marks: [
          { type: "circle", cx: 212, cy: 26, rx: 40, ry: 13, style: "muted" },
          { type: "underline", x1: 196, y1: 154, x2: 262, y2: 152, style: "highlight" }
        ]
      },
      {
        caption: "Speed first. v = u + at, so v = 0 + 9.8 × 1.8 = 17.7 m s⁻¹.",
        marks: [
          { type: "arrow", x1: 268, y1: 92, x2: 222, y2: 92, style: "accent" },
          { type: "circle", cx: 258, cy: 86, rx: 42, ry: 14, style: "muted" }
        ]
      },
      {
        caption: "Height next. s = ut + ½at², and with u = 0 that is ½ × 9.8 × 1.8² = 15.9 m.",
        marks: [
          { type: "underline", x1: 182, y1: 152, x2: 182, y2: 62, style: "accent" },
          { type: "circle", cx: 190, cy: 112, rx: 16, ry: 12, style: "muted" }
        ]
      },
      {
        caption: "Check both answers: m s⁻¹ for the speed, m for the height. A value without its unit loses the last mark.",
        marks: [
          { type: "arrow", x1: 150, y1: 150, x2: 176, y2: 168, style: "pen" },
          { type: "underline", x1: 120, y1: 172, x2: 250, y2: 170, style: "highlight" }
        ]
      }
    ]
  },
  "phy-dyn-3": {
    title: "Down a rough plane",
    steps: [
      {
        caption: "The weight W = mg = 4.0 × 9.81 = 39 N. Only part of it acts down the slope.",
        marks: [
          { type: "circle", cx: 166, cy: 122, rx: 30, ry: 26, style: "muted" },
          { type: "underline", x1: 168, y1: 176, x2: 208, y2: 174, style: "highlight" }
        ]
      },
      {
        caption: "Component down the slope: mg sin 25° = 39 × 0.42 = 16.6 N.",
        marks: [
          { type: "arrow", x1: 96, y1: 152, x2: 124, y2: 134, style: "accent" },
          { type: "circle", cx: 124, cy: 130, rx: 22, ry: 16, style: "muted" }
        ]
      },
      {
        caption: "Friction acts up the slope, so the resultant is 16.6 − 6.0 = 10.6 N down the slope.",
        marks: [
          { type: "circle", cx: 214, cy: 88, rx: 20, ry: 15, style: "muted" },
          { type: "arrow", x1: 206, y1: 120, x2: 210, y2: 96, style: "accent" }
        ]
      },
      {
        caption: "Finally a = F / m = 10.6 / 4.0 = 2.6 m s⁻² down the slope.",
        marks: [
          { type: "underline", x1: 92, y1: 226, x2: 310, y2: 226, style: "accent" }
        ]
      }
    ]
  }
};


const ATTEMPTS = [
  { id: "a1", questionId: "phy-kin-1", date: "2026-11-10", awarded: 3, total: 4 },
  { id: "a2", questionId: "cs-prog-1", date: "2026-11-08", awarded: 4, total: 5 },
  { id: "a3", questionId: "phy-waves-1", date: "2026-11-05", awarded: 3, total: 4 },
  { id: "a4", questionId: "phy-elec-1", date: "2026-11-03", awarded: 2, total: 3 },
  { id: "a5", questionId: "cs-arch-1", date: "2026-10-30", awarded: 2, total: 4 }
];

const REVIEW_ITEMS = [
  {
    id: "rev-1",
    questionId: "phy-kin-2",
    status: "AI-checked",
    aiCheck: "Pass",
    waiting: "2 hours",
    submittedBy: "Ms Chen",
    reasons: [
      "The topic and difficulty match the rest of the Kinematics bank.",
      "The mark scheme has four points for four marks."
    ],
    similarQuestionId: "phy-kin-1"
  },
  {
    id: "rev-2",
    questionId: "cs-prog-2",
    status: "Flagged",
    aiCheck: "Flagged",
    waiting: "5 hours",
    submittedBy: "Mr Patel",
    reasons: [
      "Two mark scheme points describe the same step.",
      "The difficulty may be harder than the Medium tag."
    ],
    similarQuestionId: "cs-prog-1"
  },
  {
    id: "rev-3",
    questionId: "phy-dyn-2",
    status: "Draft",
    aiCheck: "Flagged",
    waiting: "1 day",
    submittedBy: "Ms Chen",
    reasons: [
      "The final answer has no unit in the mark scheme.",
      "The question has not been checked against a past paper yet."
    ],
    similarQuestionId: "phy-dyn-1"
  },
  {
    id: "rev-4",
    questionId: "cs-db-2",
    status: "Approved",
    aiCheck: "Pass",
    waiting: "1 day",
    submittedBy: "Mr Patel",
    reasons: ["All checks passed. Waiting for publication."],
    similarQuestionId: "cs-db-1"
  },
  {
    id: "rev-5",
    questionId: "cs-alg-2",
    status: "Rejected",
    aiCheck: "Flagged",
    waiting: "2 days",
    submittedBy: "Ms Chen",
    reasons: [
      "The mark scheme gives credit for a method that does not solve the question.",
      "The wording is too close to a past paper question."
    ],
    similarQuestionId: "cs-alg-1"
  },
  {
    id: "rev-6",
    questionId: "phy-waves-2",
    status: "Published",
    aiCheck: "Pass",
    waiting: "2 days",
    submittedBy: "Mr Patel",
    reasons: ["Approved by a reviewer and published to the student bank."],
    similarQuestionId: "phy-waves-1"
  }
];

const ASSISTANT_MESSAGES = [];
/* The coach starts with an empty conversation: the seeded example
   replies now live in the question hub's Question help panel. */

const ASSISTANT_PROMPTS = [
  "Build me a revision roadmap",
  "How do I plan my week?",
  "Explain this mark scheme",
  "What should I revise?",
  "Why did I lose a mark?"
];

const CODE_WORKSPACES = {
  "cs-prog-1": {
    starterCode: "PROCEDURE LargestAndSmallest\n    DECLARE values : ARRAY[1:10] OF INTEGER\n    DECLARE largest, smallest, i : INTEGER\n\n    FOR i <- 1 TO 10\n        INPUT values[i]\n    NEXT i\n\n    largest <- values[1]\n    smallest <- values[1]\n\n    FOR i <- 2 TO 10\n        IF values[i] > largest THEN\n            largest <- values[i]\n        ENDIF\n        IF values[i] < smallest THEN\n            smallest <- values[i]\n        ENDIF\n    NEXT i\n\n    OUTPUT \"Largest: \", largest\n    OUTPUT \"Smallest: \", smallest\nEND PROCEDURE\n\nCALL LargestAndSmallest",
    sampleInput: "42\n3\n18\n99\n-4\n7\n7\n12\n0\n31",
    review: [
      { id: "declares-array", label: "Declares a 1D array for the ten values", fix: "Add DECLARE values : ARRAY[1:10] OF INTEGER before the loop." },
      { id: "reads-input", label: "Reads the values with INPUT", fix: "Read each value with INPUT inside the loop." },
      { id: "loops", label: "Loops through the values", fix: "Use FOR i <- 1 TO 10 … NEXT i." },
      { id: "tracks-max", label: "Updates largest when a value is greater", fix: "Inside the loop: IF value > largest THEN largest <- value." },
      { id: "tracks-min", label: "Updates smallest when a value is smaller", fix: "Inside the loop: IF value < smallest THEN smallest <- value." },
      { id: "outputs-both", label: "Outputs both results", fix: "Add an OUTPUT line for largest and one for smallest." }
    ],
    variables: ["i", "value", "largest", "smallest"],
    rows: [
      ["1", "42", "42", "42"],
      ["2", "3", "42", "3"],
      ["3", "18", "42", "3"],
      ["4", "", "", ""]
    ]
  },
  "cs-alg-1": {
    starterCode: "DECLARE count : INTEGER\ncount <- 0\n\nFOR i <- 1 TO 5\n    count <- count + i\nNEXT i\n\nOUTPUT count",
    sampleInput: "",
    review: [
      { id: "declares", label: "Declares the variables it uses", fix: "Add DECLARE statements at the top." },
      { id: "loops", label: "Uses a loop to repeat the work", fix: "Wrap the repeated steps in FOR … NEXT." },
      { id: "accumulates", label: "Adds each value to a running total", fix: "Inside the loop: total <- total + value." },
      { id: "outputs", label: "Outputs the result", fix: "Add an OUTPUT line at the end." }
    ],
    variables: ["i", "count"],
    rows: [
      ["1", "1"],
      ["2", "3"],
      ["3", "6"],
      ["4", "", ""]
    ]
  }
};

const COMMUNITY_POSTS = [
  {
    id: "post-1",
    author: "Aisha K.",
    subjectId: "cs",
    topicId: "cs-programming",
    questionId: "cs-prog-1",
    snippet: "I used a FOR loop and kept the first value as both the largest and smallest before comparing the rest.",
    solution: "Start by reading all ten values into the array. Set largest and smallest to values[1]. Then loop from the second value: if the value is bigger than largest, replace largest; if it is smaller than smallest, replace smallest. Print both at the end.",
    code: "PROCEDURE LargestAndSmallest\n    DECLARE values : ARRAY[1:10] OF INTEGER\n    DECLARE largest, smallest, i : INTEGER\n\n    FOR i <- 1 TO 10\n        INPUT values[i]\n    NEXT i\n\n    largest <- values[1]\n    smallest <- values[1]\n\n    FOR i <- 2 TO 10\n        IF values[i] > largest THEN\n            largest <- values[i]\n        ENDIF\n        IF values[i] < smallest THEN\n            smallest <- values[i]\n        ENDIF\n    NEXT i\n\n    OUTPUT \"Largest: \", largest\n    OUTPUT \"Smallest: \", smallest\nEND PROCEDURE\n\nCALL LargestAndSmallest",
    likes: 18,
    liked: false,
    comments: 5,
    commentList: [
      {
        author: "Maya R.",
        text: "Setting both to values[1] first makes the comparisons much simpler.",
        time: "1 hour ago",
        replies: [
          { author: "Aisha K.", text: "That is the whole trick — it removes the need to check for an empty array.", time: "1 hour ago" }
        ]
      },
      {
        author: "Daniel O.",
        text: "What happens if two values are the same?",
        time: "1 hour ago",
        replies: [
          { author: "Aisha K.", text: "Nothing changes — the first one stays as the largest or smallest.", time: "45 minutes ago" }
        ]
      },
      { author: "Mr Patel", text: "Good. Remember to indent inside the loop in the exam.", time: "30 minutes ago" }
    ],
    time: "2 hours ago"
  },
  {
    id: "post-2",
    author: "Daniel O.",
    subjectId: "physics",
    topicId: "phy-kinematics",
    questionId: "phy-kin-1",
    snippet: "Sketch the velocity–time graph first. The area underneath gives the height, so you can check your answer.",
    solution: "The ball starts from rest, so the velocity–time graph is a straight line from zero. The gradient is 9.81 m s⁻², so after 1.8 s the speed is about 17.7 m s⁻¹. The area under the line is a triangle: ½ × 1.8 × 17.7, which gives about 15.9 m.",
    likes: 12,
    liked: false,
    comments: 2,
    commentList: [
      { author: "Aisha K.", text: "The graph makes the two parts of the question feel connected.", time: "Yesterday" },
      { author: "Ms Chen", text: "Always write the unit on the height, not just the number.", time: "Yesterday" }
    ],
    time: "Yesterday"
  },
  {
    id: "post-3",
    author: "Maya R.",
    subjectId: "cs",
    topicId: "cs-databases",
    questionId: "cs-db-1",
    snippet: "The primary key is the field that is different for every record, so it can identify exactly one row.",
    solution: "Look for the field that cannot repeat and is never empty. StudentID works because every student has one and no two students share it. A name or a date of birth could repeat, so neither can identify a single record on its own.",
    likes: 9,
    liked: false,
    comments: 1,
    commentList: [
      { author: "Daniel O.", text: "Could you use two fields together as the key?", time: "2 days ago" }
    ],
    time: "2 days ago"
  },
  {
    id: "post-4",
    author: "Sofia H.",
    subjectId: "physics",
    topicId: "phy-kinematics",
    questionId: "phy-kin-1",
    snippet: "Write the two equations first, then substitute. The steepest lost marks come from stopping at one value.",
    solution: "Treat the question as two short parts. For the speed, v = u + at with u = 0 gives v = 9.81 × 1.8 ≈ 17.7 m s⁻¹. For the height, s = ut + ½at² gives ½ × 9.81 × 1.8² ≈ 15.9 m. State both answers with the right unit: metres per second for the speed and metres for the height.",
    likes: 6,
    liked: false,
    comments: 1,
    commentList: [
      { author: "Maya R.", text: "Writing both equations before substituting keeps the two answers from getting mixed up.", time: "3 days ago" }
    ],
    time: "3 days ago"
  }
];

const TEACHER_NOTES = [
  {
    id: "note-1",
    title: "Kinematics — choosing the right equation",
    subjectId: "physics",
    topicId: "phy-kinematics",
    teacher: "Mr Patel",
    time: "Today",
    isNew: true,
    excerpt: "List what you know, then pick the equation with the one unknown you need.",
    body: [
      "Start every kinematics question by writing down s, u, v, a and t. Fill in the values you are given and mark the one you need.",
      "Choose the equation that contains those four quantities and no others. If two equations seem to fit, check which one has a single unknown.",
      "Substitute only after you have rearranged the equation. That keeps the arithmetic clean and makes it easier to check the unit at the end."
    ]
  },
  {
    id: "note-2",
    title: "Pseudocode checklist",
    subjectId: "cs",
    topicId: "cs-programming",
    teacher: "Ms Chen",
    time: "Yesterday",
    isNew: true,
    excerpt: "Declare every variable, indent inside loops and use the exact command words.",
    body: [
      "Declare every variable before you use it, including loop counters and array bounds.",
      "Indent the body of every loop and every IF statement. The marker should be able to see where each block starts and ends.",
      "Use the command words exactly as they appear in the syllabus: INPUT, OUTPUT, FOR, NEXT, IF, THEN, ELSE, ENDIF."
    ]
  },
  {
    id: "note-3",
    title: "Waves — superposition in three steps",
    subjectId: "physics",
    topicId: "phy-waves",
    teacher: "Mr Patel",
    time: "Last week",
    isNew: false,
    excerpt: "Draw both waves, add the displacements, then mark nodes and antinodes.",
    body: [
      "Draw the two waves on the same axes, using a different line style for each one.",
      "At several points along the axis, add the two displacements. A positive plus a negative displacement can cancel to zero.",
      "Join the summed points to show the resultant wave. Mark the places that never move as nodes and the largest displacements as antinodes."
    ]
  }
];

const NOTIFICATIONS = [
  {
    id: "n1",
    audience: "student",
    text: "Mr Patel shared a new note: Kinematics — choosing the right equation",
    time: "Today",
    unread: true,
    route: "/notes"
  },
  {
    id: "n2",
    audience: "student",
    text: "Your solution to a programming question received a comment",
    time: "Yesterday",
    unread: true,
    route: "/community"
  },
  {
    id: "n3",
    audience: "student",
    text: "Your result for a Waves practice question is ready",
    time: "2 days ago",
    unread: false,
    route: "/result/phy-waves-1"
  },
  {
    id: "n4",
    audience: "teacher",
    text: "Aisha Khan submitted a solution to the class community",
    time: "Today",
    unread: true,
    route: "/class/class-1"
  },
  {
    id: "n5",
    audience: "teacher",
    text: "Your class 12B Computer Science averaged 74% this week",
    time: "Yesterday",
    unread: false,
    route: "/class/class-1"
  },
  {
    id: "n6",
    audience: "reviewer",
    text: "A Physics question is waiting for review",
    time: "2 hours ago",
    unread: true,
    route: "/review/rev-1"
  },
  {
    id: "n7",
    audience: "reviewer",
    text: "A Computer Science question was flagged by the check",
    time: "5 hours ago",
    unread: true,
    route: "/review/rev-2"
  }
];

const CLASSES = [
  { id: "class-1", name: "12B Computer Science", code: "CS-12B-4Q", students: 24, subjectId: "cs" },
  { id: "class-2", name: "13A Physics", code: "PH-13A-7K", students: 19, subjectId: "physics" }
];

const PROFILES = {
  student: { name: "Aisha Khan", email: "aisha.khan@example.com", initials: "AK" },
  teacher: { name: "Mr Patel", email: "r.patel@example.com", initials: "MP" },
  reviewer: { name: "R. Chen", email: "review@example.com", initials: "RC" }
};

const CLASS_STUDENTS = {
  "class-1": [
    { name: "Aisha Khan", progress: 78, lastActive: "Today" },
    { name: "Daniel Okafor", progress: 64, lastActive: "Today" },
    { name: "Maya Rahman", progress: 91, lastActive: "Yesterday" },
    { name: "Leo Martins", progress: 52, lastActive: "2 days ago" },
    { name: "Sofia Haddad", progress: 83, lastActive: "Today" },
    { name: "Noah Williams", progress: 45, lastActive: "4 days ago" },
    { name: "Priya Shah", progress: 69, lastActive: "Yesterday" },
    { name: "Ethan Cole", progress: 37, lastActive: "Last week" }
  ],
  "class-2": [
    { name: "Amelia Ford", progress: 86, lastActive: "Today" },
    { name: "Omar Aziz", progress: 72, lastActive: "Yesterday" },
    { name: "Grace Lin", progress: 94, lastActive: "Today" },
    { name: "Jacob Reid", progress: 58, lastActive: "3 days ago" },
    { name: "Zara Ali", progress: 67, lastActive: "Yesterday" },
    { name: "Tom Becker", progress: 41, lastActive: "Last week" }
  ]
};

const CLASS_SHARED = {
  "class-1": [
    {
      type: "note",
      title: "Pseudocode checklist",
      detail: "Ms Chen · Yesterday",
      noteId: "note-2"
    },
    {
      type: "questions",
      title: "Programming practice set",
      detail: "6 questions · 3 days ago",
      questionIds: ["cs-prog-1", "cs-prog-2", "cs-alg-1"]
    }
  ],
  "class-2": [
    {
      type: "note",
      title: "Kinematics — choosing the right equation",
      detail: "Mr Patel · Today",
      noteId: "note-1"
    },
    {
      type: "questions",
      title: "Kinematics practice set",
      detail: "4 questions · 2 days ago",
      questionIds: ["phy-kin-1", "phy-kin-2"]
    }
  ]
};

/* ------------------------------------------------------------
   Screen map — every screen, its phase and a plain-language note
   ------------------------------------------------------------ */

const SCREENS = [
  {
    id: "foundations",
    code: "P0",
    name: "Foundations preview",
    phase: 0,
    summary: "The shell, design tokens and shared components, shown together.",
    contents: [
      "The app shell for each role",
      "Colour and type tokens",
      "Every shared component and its states"
    ],
    note: "A temporary page for the structural walkthrough. It is replaced by the student Home screen in Phase 1.",
    status: "built",
    route: "/foundations"
  },
  {
    id: "sitemap",
    code: "P0",
    name: "Sitemap",
    phase: 0,
    summary: "Every screen in the prototype, grouped by phase.",
    contents: [
      "Every screen, with its phase",
      "Links to anything already built",
      "A short purpose for each screen"
    ],
    note: "The map for the walkthrough. Jump to any screen that has been built and see what comes next.",
    status: "built",
    route: "/sitemap"
  },
  {
    id: "s1",
    code: "S1",
    name: "Sign up / Login",
    phase: 1,
    summary: "Email and password, plus a role choice at sign up.",
    contents: [
      "Email, password and a clear primary action",
      "A forgot password link",
      "Sign up: Student or Teacher, with no subject choice"
    ],
    note: "Where a student or teacher creates an account. Reviewers are added by an admin, so they are not offered here.",
    status: "built",
    route: "/login"
  },
  {
    id: "s2",
    code: "S2",
    name: "Home",
    phase: 1,
    summary: "Continue where you left off, every subject and recent activity.",
    contents: [
      "A continue card with the last topic",
      "One card per subject, as a way into the catalogue",
      "Recent attempts, community posts and teacher notes"
    ],
    note: "The student's starting point after signing in. It points back into the last topic and shows what is new.",
    status: "built",
    route: "/"
  },
  {
    id: "s3",
    code: "S3",
    name: "Topic browser",
    phase: 1,
    summary: "Search every subject by topic and see progress.",
    contents: [
      "A subject filter over the whole catalogue",
      "Search across topic names and descriptions",
      "One row per topic, with a subject badge"
    ],
    note: "Students choose a topic here before picking questions. Progress on each row shows how much of the topic is left.",
    status: "built",
    route: "/topics"
  },
  {
    id: "s4",
    code: "S4",
    name: "Topic page",
    phase: 1,
    summary: "Past paper and practice questions for one topic.",
    contents: [
      "Two tabs: past paper questions and practice questions",
      "Filters for year, paper and difficulty",
      "A list of questions with marks and progress"
    ],
    note: "The heart of practice: one topic, two kinds of question. Practice questions are already approved, so students simply choose from the bank.",
    status: "built",
    route: "/topic/phy-kinematics"
  },
  {
    id: "s5",
    code: "S5",
    name: "Question hub",
    phase: 1,
    summary: "One question with four tabs: Solve, Solutions, Discussion and Stats.",
    contents: [
      "The question header, always above the tabs",
      "Solve: answer box, upload, Scan and check, Question help",
      "Solutions, Discussion and Stats for the same question"
    ],
    note: "The question is the place where it lives: solve it, read other solutions, discuss it and see how often it has appeared.",
    status: "built",
    route: "/question/phy-kin-1"
  },
  {
    id: "s5-solution",
    code: "S5A",
    name: "Solution detail",
    phase: 1,
    summary: "One full solution, its likes and its own comment thread.",
    contents: [
      "The question the solution answers",
      "The full worked solution from another student",
      "Likes and a comment thread under the solution"
    ],
    note: "Each solution can be read in full and discussed on its own, separately from the question-level discussion.",
    status: "built",
    route: "/question/phy-kin-1/solutions/post-2"
  },
  {
    id: "s6",
    code: "S6",
    name: "Result screen",
    phase: 1,
    summary: "Marks, mark scheme points and plain-language feedback.",
    contents: [
      "Marks awarded out of the total",
      "Each mark scheme point, earned or missed",
      "Next question, Retry and Share my solution"
    ],
    note: "Shows exactly where the marks came from, then offers the next step: another question, another try or sharing the solution.",
    status: "built",
    route: "/result/phy-kin-1"
  },
  {
    id: "s7",
    code: "S7",
    name: "Reviewer queue",
    phase: 2,
    summary: "Practice questions waiting for a human decision.",
    contents: [
      "One row per question waiting",
      "Subject, topic, difficulty and time waiting",
      "Filters by subject and topic"
    ],
    note: "Reviewers only. Students never see drafts, review states or anything about how a question was made.",
    status: "built",
    route: "/queue"
  },
  {
    id: "s8",
    code: "S8",
    name: "Review detail",
    phase: 2,
    summary: "The question, its mark scheme and an automatic first check.",
    contents: [
      "The practice question and mark scheme",
      "The automatic check with its reasons",
      "The closest past paper question for comparison"
    ],
    note: "A reviewer compares the new question with a real past paper question, then approves, edits or rejects it.",
    status: "built",
    route: "/review/rev-1"
  },
  {
    id: "s9",
    code: "S9",
    name: "Study coach",
    phase: 2,
    summary: "Ask for planning help, a mark scheme explanation or a question walk-through.",
    contents: [
      "Message history and an input box",
      "Suggested prompts, including a revision roadmap",
      "Attach any question and a file or photo"
    ],
    note: "A study helper for planning and for work the student is already doing. It does not make new questions.",
    status: "built",
    route: "/assistant"
  },
  {
    id: "s10",
    code: "S10",
    name: "My progress",
    phase: 2,
    summary: "Marks per topic, weak topics and attempt history.",
    contents: [
      "Marks per topic as simple bars",
      "Weak topics with a link to practise them",
      "Every past attempt"
    ],
    note: "Turns results into a plan: which topics are weak and where to go next.",
    status: "built",
    route: "/progress"
  },
  {
    id: "s11",
    code: "S11",
    name: "Code question screen",
    phase: 3,
    summary: "Pseudocode editor, run output and dry-run table.",
    contents: [
      "The question above a pseudocode editor",
      "Run and an output panel",
      "An editable dry-run table"
    ],
    note: "Computer Science answers need working, not just a final line. The dry-run table lets students show the steps.",
    status: "built",
    route: "/code/cs-prog-1"
  },
  {
    id: "s12",
    code: "S12",
    name: "Physics question screen",
    phase: 3,
    summary: "Interactive diagram, reset and answer box.",
    contents: [
      "The question above a diagram",
      "A few sliders for angle or force",
      "Reset diagram and an answer box"
    ],
    note: "A diagram students can adjust before answering, so the physical situation is clear.",
    status: "built",
    route: "/diagram/phy-dyn-1"
  },
  {
    id: "s13",
    code: "S13",
    name: "Community feed",
    phase: 4,
    summary: "Solved questions shared by students, linked to the question hub.",
    contents: [
      "Question, author and solution snippet",
      "Likes and comment counts that update the same solutions",
      "Filters by subject and topic"
    ],
    note: "Students learn from each other's worked solutions. Every post points back to the question it solves and its own solution detail.",
    status: "built",
    route: "/community"
  },
  {
    id: "s14",
    code: "S14",
    name: "Post a solution",
    phase: 4,
    summary: "Pick a question, write, preview and post.",
    contents: [
      "Choose the question being solved, pre-filled when it comes from a question",
      "Write the solution and attach a file",
      "Preview before posting"
    ],
    note: "The route from a question or result screen to the community. A student can share the solution they just wrote.",
    status: "built",
    route: "/post-solution"
  },
  {
    id: "s15",
    code: "S15",
    name: "Teacher notes (student view)",
    phase: 4,
    summary: "Notes shared with the student's class.",
    contents: [
      "Notes grouped by topic",
      "A new badge for unseen notes",
      "The teacher and class the note came from"
    ],
    note: "Only notes shared with the student's own class appear here.",
    status: "built",
    route: "/notes"
  },
  {
    id: "s16",
    code: "S16",
    name: "Notifications",
    phase: 4,
    summary: "Updates that open the related screen.",
    contents: [
      "Shared notes, replies and results",
      "Read and unread states",
      "Each item opens what it refers to"
    ],
    note: "A short list of what changed. Every item leads to the screen where the student can act on it.",
    status: "built",
    route: "/notifications"
  },
  {
    id: "s17",
    code: "S17",
    name: "Teacher dashboard",
    phase: 4,
    summary: "Classes, student counts and class codes.",
    contents: [
      "The teacher's classes",
      "Student count for each class",
      "Create class and a class code to invite students"
    ],
    note: "The teacher's starting point. A class code lets students join without an admin.",
    status: "built",
    route: "/dashboard"
  },
  {
    id: "s18",
    code: "S18",
    name: "Class detail",
    phase: 4,
    summary: "Student progress and everything shared with one class.",
    contents: [
      "Student list with progress",
      "Notes shared with this class",
      "Questions shared with this class"
    ],
    note: "One class at a time: who is in it, how they are doing and what they have been given.",
    status: "built",
    route: "/class/class-1"
  },
  {
    id: "s19",
    code: "S19",
    name: "Share notes or questions",
    phase: 4,
    summary: "Send a note or chosen questions to classes, with a subject filter.",
    contents: [
      "Choose one or more classes",
      "Upload a note or pick questions, filtered by subject",
      "A title, a message and Send"
    ],
    note: "How teachers hand work to a class. The same questions stay in the bank for everyone else.",
    status: "built",
    route: "/share"
  },
  {
    id: "s20",
    code: "S20",
    name: "Profile and settings",
    phase: 5,
    summary: "Account details and sign out.",
    contents: [
      "Name, email and role",
      "No subject choice: every subject stays open",
      "Sign out"
    ],
    note: "The only screen where account details are changed.",
    status: "built",
    route: "/profile"
  }
];

/* ------------------------------------------------------------
   Inspect notes
   Each note answers: what is this, who uses it, why is it here,
   where does it lead. Two or three short lines, no technical detail.
   ------------------------------------------------------------ */

const INSPECT_NOTES = {
  "chrome.bar": {
    title: "Prototype controls",
    lines: [
      "Only for this walkthrough. None of these controls appear in the real app.",
      "Use them to preview a role, a phone-sized screen, or the notes behind each part."
    ]
  },
  "chrome.role": {
    title: "Role switcher",
    lines: [
      "Preview the prototype as a student, teacher or reviewer.",
      "Only for this walkthrough; real users sign in with one role."
    ]
  },
  "chrome.mobile": {
    title: "Mobile app view",
    lines: [
      "Shows the same screens inside a phone-sized frame.",
      "Navigation moves to the bottom tab bar, as it will in the mobile app."
    ]
  },
  "chrome.inspect": {
    title: "Inspect mode",
    lines: [
      "Turn this on, then hover or tap any part of the app.",
      "A short note explains what it is, who uses it and where it leads."
    ]
  },
  "chrome.foundations": {
    title: "Foundations preview",
    lines: [
      "The design-system preview, now on its own route.",
      "The Home tab is a real screen in Phase 1."
    ]
  },
  "chrome.sitemap": {
    title: "Sitemap",
    lines: [
      "Every screen in the prototype, grouped by phase.",
      "Use it to jump to anything that has been built."
    ]
  },
  "shell.topbar": {
    title: "Top bar",
    lines: [
      "The app's header: the wordmark, notifications and the profile link.",
      "Students, teachers and reviewers all see it."
    ]
  },
  "shell.wordmark": {
    title: "Excelerate wordmark",
    lines: ["Returns to the home screen for the current role."]
  },
  "shell.bell": {
    title: "Notifications",
    lines: [
      "Opens the list of updates: shared notes, replies and results.",
      "The dot shows there is something unseen."
    ]
  },
  "shell.tabbar": {
    title: "Bottom tab bar",
    lines: [
      "Main navigation for students. Teachers and reviewers see different tabs.",
      "It stays at the bottom of the phone frame on every screen."
    ]
  },
  "shell.sidenav": {
    title: "Side navigation",
    lines: [
      "The same tabs, moved to the side on a wide screen.",
      "The current screen is marked in crimson."
    ]
  },
  "tab.home": {
    title: "Home tab",
    lines: [
      "The starting point: continue work, browse every subject and see recent activity.",
      "It brings the last topic, recent marks and new notes into one place."
    ]
  },
  "tab.topics": {
    title: "Topics tab",
    lines: ["Browse the syllabus by topic, then choose past paper or practice questions."]
  },
  "tab.community": {
    title: "Community tab",
    lines: ["Solved questions shared by other students, with likes and comments."]
  },
  "tab.assistant": {
    title: "Coach tab",
    lines: [
      "Ask for planning help, a mark scheme explanation or a walk-through of a question.",
      "Any question can be attached, along with a file or photo."
    ]
  },
  "tab.progress": {
    title: "Progress tab",
    lines: ["Marks per topic, weak topics and every past attempt."]
  },
  "tab.dashboard": {
    title: "Dashboard tab",
    lines: ["The teacher's classes, student counts and class codes."]
  },
  "tab.classes": {
    title: "Classes tab",
    lines: ["One class: student progress, shared notes and shared questions."]
  },
  "tab.share": {
    title: "Share tab",
    lines: ["Send a note or chosen questions to one or more classes."]
  },
  "tab.queue": {
    title: "Queue tab",
    lines: [
      "Practice questions waiting for a reviewer's decision.",
      "Only reviewers see this screen and its status labels."
    ]
  },
  "foundations.intro": {
    title: "Foundations preview",
    lines: [
      "A temporary landing page for Phase 0.",
      "It shows the shell, tokens and shared components before the student screens are built."
    ]
  },
  "foundations.shell": {
    title: "App shell",
    lines: [
      "The frame every screen sits in: top bar, bottom tab bar and role tabs.",
      "Switching role changes the tabs but keeps the same shell."
    ]
  },
  "foundations.tokens": {
    title: "Design tokens",
    lines: [
      "The named colours every screen uses, so the look stays consistent.",
      "Crimson is kept for primary actions and active states only."
    ]
  },
  "foundations.type": {
    title: "Type scale",
    lines: [
      "Inter throughout, with tight tracking on headings.",
      "Body text stays at 16px or larger for comfortable reading."
    ]
  },
  "foundations.buttons": {
    title: "Buttons",
    lines: [
      "Primary actions are crimson; secondary actions use a hairline outline.",
      "Each button has hover, focus, active and disabled states."
    ]
  },
  "foundations.inputs": {
    title: "Inputs",
    lines: [
      "Text fields, text areas and selects share one style.",
      "Labels stay visible on every screen size; errors appear below the field."
    ]
  },
  "foundations.tabs": {
    title: "Tabs",
    lines: [
      "Switch between two views of the same content without leaving the screen.",
      "Used for past paper and practice questions on a topic."
    ]
  },
  "foundations.card": {
    title: "Card",
    lines: [
      "A simple panel that groups related information.",
      "Featured cards use a slightly deeper tone, never a shadow."
    ]
  },
  "foundations.listrow": {
    title: "List row",
    lines: [
      "One item in a list: a title, a short line of detail and an optional badge.",
      "The whole row is the tap target and shows where it leads."
    ]
  },
  "foundations.badge": {
    title: "Badge",
    lines: [
      "A small label for question type, difficulty or something new.",
      "It stays short so it never competes with the question itself."
    ]
  },
  "foundations.filterbar": {
    title: "Filter bar",
    lines: [
      "Narrows a list by paper, year or difficulty.",
      "Filters wrap onto new lines rather than hiding labels on a phone."
    ]
  },
  "foundations.breadcrumb": {
    title: "Breadcrumb",
    lines: [
      "Shows the path back: subject, topic, question.",
      "Every step is a link on larger screens."
    ]
  },
  "breadcrumb": {
    title: "Breadcrumb",
    lines: [
      "Shows where this screen sits: subject, topic, question or result.",
      "Each earlier step is a link back to that level."
    ]
  },
  "foundations.empty": {
    title: "Empty state",
    lines: [
      "Shown when a list has nothing in it yet.",
      "It explains what will appear here instead of leaving a blank space."
    ]
  },
  "foundations.modal": {
    title: "Modal",
    lines: [
      "A short, focused decision that sits above the screen.",
      "It closes with Escape or a visible close button."
    ]
  },
  "foundations.next": {
    title: "Next phase",
    lines: [
      "Phase 1 is built: sign up, Home, topics, questions and results.",
      "The sitemap shows every screen and its phase."
    ]
  },
  "sitemap.intro": {
    title: "Sitemap",
    lines: [
      "The structural map of the whole prototype.",
      "Screens are grouped by the phase that builds them."
    ]
  },
  "sitemap.phase0": {
    title: "Phase 0 — Foundations",
    lines: ["The shell, shared components and this map. Built first so every later screen has a frame."]
  },
  "sitemap.phase1": {
    title: "Phase 1 — Student core loop",
    lines: ["The smallest complete journey: sign in, pick a topic, answer, see the result."]
  },
  "sitemap.phase2": {
    title: "Phase 2 — The review and help layer",
    lines: ["How practice questions reach students safely, and where students go for help."]
  },
  "sitemap.phase3": {
    title: "Phase 3 — Subject tools",
    lines: ["Extra answer tools that only Computer Science and Physics need."]
  },
  "sitemap.phase4": {
    title: "Phase 4 — Community and teachers",
    lines: ["Shared solutions, teacher notes, notifications and class management."]
  },
  "sitemap.phase5": {
    title: "Phase 5 — Final pass",
    lines: ["Profile and settings, plus the empty, loading and error states for the main lists."]
  },
  "home.intro": {
    title: "Student Home",
    lines: [
      "The student's starting point after signing in.",
      "It gathers the next piece of work, every subject and what is new."
    ]
  },
  "home.continue": {
    title: "Continue where you left off",
    lines: [
      "The last topic the student worked on.",
      "One tap returns to that topic, so there is no searching after a break."
    ]
  },
  "home.subjects": {
    title: "Browse by subject",
    lines: [
      "Every subject in the catalogue, not a list of enrolments.",
      "Each card opens the topic list filtered to that subject."
    ]
  },
  "home.subjectCard": {
    title: "Subject card",
    lines: [
      "A subject at a glance: topics, questions done and progress.",
      "Opening it shows that subject's topics. Nothing is enrolled or locked."
    ]
  },
  "home.activity": {
    title: "Recent activity",
    lines: [
      "The last few questions the student answered.",
      "Each row opens the result, so marks can be checked again."
    ]
  },
  "home.attempt": {
    title: "One past attempt",
    lines: [
      "A question, its mark and the date it was answered.",
      "It opens the result and mark scheme for that question."
    ]
  },
  "home.community": {
    title: "Community preview",
    lines: [
      "A short look at solved questions shared by other students.",
      "The full feed lives in the Community tab."
    ]
  },
  "home.notes": {
    title: "Teacher notes preview",
    lines: [
      "Notes shared with the student's class by a teacher.",
      "Unseen notes are marked new; the full list opens from here."
    ]
  },
  "login.intro": {
    title: "Sign up or log in",
    lines: [
      "The way into the app for students and teachers.",
      "Reviewers are added by an admin, so there is no reviewer option."
    ]
  },
  "login.tabs": {
    title: "Log in and sign up",
    lines: [
      "Switch between signing in and creating an account.",
      "The form below changes, but the screen stays the same."
    ]
  },
  "login.loginForm": {
    title: "Log in form",
    lines: [
      "Email and password for an existing account.",
      "A real sign-in would check these details; this prototype simply continues."
    ]
  },
  "login.forgot": {
    title: "Forgot password",
    lines: [
      "Sends a reset link to the email entered above.",
      "It does not reveal whether an account exists."
    ]
  },
  "login.signupForm": {
    title: "Sign up form",
    lines: [
      "Create a student or teacher account.",
      "No subjects are chosen here: every subject is open from the start."
    ]
  },
  "login.role": {
    title: "Account role",
    lines: [
      "Students practise; teachers share notes and questions with classes.",
      "Reviewers are not offered because an admin creates those accounts."
    ]
  },
  "topics.intro": {
    title: "Topic browser",
    lines: [
      "Every topic in the catalogue, across all subjects.",
      "The subject filter narrows the list to one course; students choose a topic before seeing its questions."
    ]
  },
  "topics.subjectFilter": {
    title: "Subject filter",
    lines: [
      "Shows all subjects, or one subject at a time.",
      "Changing it opens /topics or /topics/<subject>, so the filtered view can be linked to."
    ]
  },
  "topics.search": {
    title: "Search topics",
    lines: [
      "Narrows the topic list as the student types.",
      "It searches topic names, descriptions and the subject name."
    ]
  },
  "topics.list": {
    title: "Topic list",
    lines: [
      "One row per topic, with the bank size and progress.",
      "Each row carries its subject code so a mixed list stays clear."
    ]
  },
  "topics.row": {
    title: "One topic",
    lines: [
      "The topic name, how many questions it holds and how many are done.",
      "The badge shows which subject the topic belongs to."
    ]
  },
  "topic.intro": {
    title: "Topic page",
    lines: [
      "One topic and its two kinds of question.",
      "The description sets the scope before practice starts."
    ]
  },
  "topic.tabs": {
    title: "Question kinds",
    lines: [
      "Past paper questions are real CAIE questions; practice questions are new ones in the same style.",
      "Both use the same question and result screens."
    ]
  },
  "topic.filters": {
    title: "Question filters",
    lines: [
      "Narrow the list by year, paper or difficulty.",
      "Year and paper apply only to past paper questions."
    ]
  },
  "topic.questionRow": {
    title: "One question",
    lines: [
      "A short view of the question: its opening line, marks and difficulty.",
      "The badge on the right shows whether it has been attempted."
    ]
  },
  "topic.empty": {
    title: "No practice questions yet",
    lines: [
      "Shown when a topic has no practice questions.",
      "Past paper questions are still available in the other tab."
    ]
  },
  "question.header": {
    title: "Question details",
    lines: [
      "The question type, source, marks and difficulty, always above the tabs.",
      "Switching tabs never loses sight of the question, and nothing here is sticky."
    ]
  },
  "question.tabs": {
    title: "Question tabs",
    lines: [
      "Four ways to look at the same question: Solve, Solutions, Discussion and Stats.",
      "Each tab is its own route, so a tab can be linked to or reloaded directly."
    ]
  },
  "question.solve": {
    title: "Solve tab",
    lines: [
      "The place to answer: working, an upload, a sample check and question help.",
      "A typed answer, an attached file and the check survive switching tabs."
    ]
  },
  "question.upload": {
    title: "Upload your working",
    lines: [
      "Attach a photo of handwritten working or a PDF.",
      "The file name is shown and images get a small preview. The prototype never reads or sends the file."
    ]
  },
  "question.scan": {
    title: "Scan and check",
    lines: [
      "A sample comparison with this question's mark scheme.",
      "It is clearly a prototype result, not real marking, and it does not read the file."
    ]
  },
  "question.help": {
    title: "Question help",
    lines: [
      "A compact helper that stays focused on this question.",
      "Replies are written for the prototype, not produced by a live model."
    ]
  },
  "question.helpModes": {
    title: "Hint, walk-through or check",
    lines: [
      "Hint gives one starting point; Walk me through gives the method steps.",
      "Check my working points back to the sample check above."
    ]
  },
  "question.helpReply": {
    title: "Help replies",
    lines: [
      "The conversation stays on this question and survives a tab switch.",
      "For the main demo questions the walk-through uses authored method steps."
    ]
  },
  "question.stem": {
    title: "The question",
    lines: [
      "The question itself, with a diagram when one is needed.",
      "The layout is the same for both question kinds."
    ]
  },
  "question.diagram": {
    title: "Diagram placeholder",
    lines: [
      "A simple placeholder for the diagram the question refers to.",
      "In the real app this would be the circuit, graph or flowchart."
    ]
  },
  "question.walkthrough": {
    title: "Walkthrough",
    lines: [
      "A short script of annotations drawn over the question, one step at a time.",
      "The marks are authored shapes, not a recording — no video or live model is involved."
    ]
  },
  "question.player": {
    title: "Step player",
    lines: [
      "Play, pause, step back and forward, scrub, or change the speed.",
      "Every step shows the reasoning for that line of working."
    ]
  },
  "question.figure": {
    title: "Question diagram",
    lines: [
      "A simple 2D figure for the situation in the question.",
      "It is drawn in the page itself, so it stays crisp and needs no image files."
    ]
  },
  "question.scanChecking": {
    title: "Checking",
    lines: [
      "A short simulation while the sample check runs.",
      "It reads the answer, compares it with the mark scheme and then estimates a mark."
    ]
  },
  "question.scanFeedback": {
    title: "Check feedback",
    lines: [
      "Plain-language notes on what the sample check found.",
      "It names the mark-scheme points still to show and reminds you when the file was not read."
    ]
  },
  "question.uploadRemove": {
    title: "Remove the attachment",
    lines: [
      "Takes the file off this attempt and clears the preview.",
      "Nothing was uploaded anywhere, so removing it only clears the screen."
    ]
  },
  "question.commentReply": {
    title: "Reply to a comment",
    lines: [
      "Opens a short reply box under the comment.",
      "Replies are indented under the comment they answer."
    ]
  },
  "question.commentReplyForm": {
    title: "Send a reply",
    lines: [
      "Writes a reply to one comment, not a new top-level comment.",
      "Replies stay in memory for this session only."
    ]
  },
  "question.solutionTry": {
    title: "Try this solution",
    lines: [
      "Opens the code workspace with this solution already in the editor.",
      "Run it to see the output, then edit it to try your own version."
    ]
  },
  "question.answer": {
    title: "Answer box",
    lines: [
      "Where the student writes their working and final answer.",
      "The draft is kept in memory while the question is open, even across tabs."
    ]
  },
  "question.actions": {
    title: "Submit or save",
    lines: [
      "Submit sends the answer for marking; Save for later keeps it in the list.",
      "The workspace link opens the subject tool for this question. Nothing is sent anywhere in this prototype."
    ]
  },
  "question.save": {
    title: "Save for later",
    lines: [
      "Keeps the question in the student's list without submitting.",
      "It can be reopened from the same topic later."
    ]
  },
  "question.workspace": {
    title: "Open the subject workspace",
    lines: [
      "Computer Science questions open a pseudocode workspace; Physics questions open a diagram workspace.",
      "The workspace is part of answering this question, not a separate topic."
    ]
  },
  "question.solutions": {
    title: "Solutions tab",
    lines: [
      "Every solution shared for this question, most liked first.",
      "The same solutions appear in the community feed, so a like counts in both places."
    ]
  },
  "question.solutionRow": {
    title: "One solution",
    lines: [
      "Who wrote it, when, and the first part of their method.",
      "Like it, open its comments, or read it in full."
    ]
  },
  "question.solutionEmpty": {
    title: "No solutions yet",
    lines: [
      "Shown when nobody has shared a solution for this question.",
      "It offers the shortest route to being the first."
    ]
  },
  "question.solutionDetail": {
    title: "Solution detail",
    lines: [
      "The question, the full worked solution and its own comment thread.",
      "This is separate from the question-level Discussion tab."
    ]
  },
  "question.solutionLike": {
    title: "Like a solution",
    lines: [
      "One tap adds a like; tapping again removes it.",
      "The count is the same number the community feed shows."
    ]
  },
  "question.solutionComments": {
    title: "Solution comments",
    lines: [
      "Comments on one solution, named with who wrote them and when.",
      "The count next to the solution opens the same thread."
    ]
  },
  "question.solutionCommentForm": {
    title: "Add a comment",
    lines: [
      "Write a comment about this solution and post it.",
      "Comments stay in memory for this session only."
    ]
  },
  "question.discussion": {
    title: "Discussion tab",
    lines: [
      "One thread for the question itself, separate from the comments on a solution.",
      "Anyone can read it; a student can add a comment."
    ]
  },
  "question.discussionForm": {
    title: "Add to the discussion",
    lines: [
      "Write a question or a tip about this question and post it.",
      "New comments stay in memory for this session only."
    ]
  },
  "question.discussionEmpty": {
    title: "No discussion yet",
    lines: [
      "Shown when nobody has commented on this question.",
      "It invites the first question rather than leaving a blank panel."
    ]
  },
  "question.stats": {
    title: "Stats tab",
    lines: [
      "How often this question has appeared, which years and papers, and how hard it is.",
      "Practice questions have no past appearances, and the totals are mock data."
    ]
  },
  "question.statsYears": {
    title: "Years seen",
    lines: [
      "The past paper years this question appeared in.",
      "A practice question shows that it has no past appearances yet."
    ]
  },
  "result.score": {
    title: "The mark",
    lines: [
      "The mark for this attempt, out of the total.",
      "It is the first thing a student sees after submitting."
    ]
  },
  "result.markscheme": {
    title: "Mark scheme",
    lines: [
      "Every point the marker looked for, shown as earned or missed.",
      "This turns a mark into something a student can act on."
    ]
  },
  "result.point": {
    title: "One mark scheme point",
    lines: [
      "A single point and whether it was earned.",
      "Missed points show exactly what to add next time."
    ]
  },
  "result.feedback": {
    title: "Feedback",
    lines: [
      "A short, plain-language comment on the answer.",
      "It points to the next step rather than repeating the mark scheme."
    ]
  },
  "result.actions": {
    title: "What next",
    lines: [
      "Three ways on: another question, another try, or sharing the solution.",
      "Sharing opens the community composer with this question already chosen."
    ]
  },
  "queue.intro": {
    title: "Reviewer queue",
    lines: [
      "The reviewer's starting point: practice questions waiting for a decision.",
      "Only reviewers see this screen and its status labels."
    ]
  },
  "queue.filters": {
    title: "Queue filters",
    lines: [
      "Narrow the queue by subject and topic.",
      "The topic list changes with the subject."
    ]
  },
  "queue.list": {
    title: "Questions waiting",
    lines: [
      "One row per practice question, with its review state and automatic check.",
      "Recently decided questions stay visible until they are published."
    ]
  },
  "queue.row": {
    title: "One review item",
    lines: [
      "Shows the question, subject, topic, difficulty and time waiting.",
      "The two badges show the review state and the automatic check."
    ]
  },
  "review.intro": {
    title: "Review detail",
    lines: [
      "Everything a reviewer needs before deciding: the question, its mark scheme and the automatic check.",
      "The status at the top changes as the question moves through review."
    ]
  },
  "review.question": {
    title: "Question and mark scheme",
    lines: [
      "The practice question exactly as a student would see it, with its mark scheme.",
      "The Edit button lets a reviewer correct the wording before approving."
    ]
  },
  "review.ai": {
    title: "Automatic check",
    lines: [
      "A first pass that looks for common problems: mark totals, overlap and difficulty.",
      "It only advises. A human reviewer makes the final decision."
    ]
  },
  "review.similar": {
    title: "Closest past paper question",
    lines: [
      "A real past paper question on the same topic, for comparison.",
      "The reviewer checks that the new question adds something rather than repeating it."
    ]
  },
  "review.comment": {
    title: "Reviewer comment",
    lines: [
      "A place to explain the decision to the person who wrote the question.",
      "The comment stays with the question when it is approved, edited or rejected."
    ]
  },
  "review.actions": {
    title: "Approve, edit or reject",
    lines: [
      "Approve moves the question on to publication; Reject stops it.",
      "Edit opens the question text so it can be corrected first."
    ]
  },
  "assistant.intro": {
    title: "Study coach",
    lines: [
      "A study helper for planning, revision and mark schemes.",
      "It explains work the student is already doing; it does not make new questions."
    ]
  },
  "assistant.chat": {
    title: "Conversation",
    lines: [
      "The message history stays on this screen while the student moves around the prototype.",
      "Replies are written for this walkthrough, not produced by a live model."
    ]
  },
  "assistant.prompts": {
    title: "Suggested prompts",
    lines: [
      "Short starting points, including a two-week revision roadmap.",
      "Each one sends a message and shows the kind of answer the coach gives."
    ]
  },
  "assistant.form": {
    title: "Ask a question",
    lines: [
      "Type a message, or attach any question from the bank so the answer has context.",
      "The attached question is shown with the message."
    ]
  },
  "assistant.file": {
    title: "Attach a file or photo",
    lines: [
      "Shows the file name beside the message it was sent with.",
      "The file is never read or uploaded in this prototype."
    ]
  },
  "assistant.empty": {
    title: "Empty conversation",
    lines: [
      "The coach starts with no messages, so nothing pretends to be a real conversation.",
      "Pick a prompt or type a message to begin."
    ]
  },
  "progress.intro": {
    title: "My progress",
    lines: [
      "Turns results into a plan: what is going well and what needs another look.",
      "Only the student's own attempts appear here."
    ]
  },
  "progress.summary": {
    title: "Progress summary",
    lines: [
      "Three numbers: marks earned, attempts made and the average mark.",
      "They give a quick sense of the whole subject before the detail."
    ]
  },
  "progress.topics": {
    title: "Marks per topic",
    lines: [
      "One bar per topic the student has attempted.",
      "The bar makes a weak topic obvious without reading every mark."
    ]
  },
  "progress.topic": {
    title: "One topic bar",
    lines: [
      "Shows the marks earned, the total and the percentage for that topic.",
      "Topics with no attempts are left out rather than shown as zero."
    ]
  },
  "progress.weak": {
    title: "Weak topics",
    lines: [
      "The topics with the lowest marks, strongest first.",
      "Each one has a direct link to practice, so the next step is one tap away."
    ]
  },
  "progress.weakRow": {
    title: "Practise a weak topic",
    lines: [
      "Shows the topic, the mark and how many attempts it is based on.",
      "Opening it goes straight to the Practice tab for that topic."
    ]
  },
  "progress.history": {
    title: "Attempt history",
    lines: [
      "Every attempt so far, newest first.",
      "Each row opens the original result and mark scheme."
    ]
  },
  "progress.attempt": {
    title: "One attempt",
    lines: [
      "The topic, the question, the date and the mark.",
      "It is a shortcut back to the result rather than a new screen."
    ]
  },
  "community.intro": {
    title: "Community feed",
    lines: [
      "Worked solutions shared by students, with the question kept in view.",
      "The feed is for learning from each other, not for copying an answer without thinking."
    ]
  },
  "community.post": {
    title: "Post a solution",
    lines: [
      "Opens the form for sharing your own working.",
      "Only students see this action; teachers and reviewers read the feed."
    ]
  },
  "community.filters": {
    title: "Feed filters",
    lines: [
      "Narrow the feed to one subject or one topic.",
      "The topic list changes with the subject you choose."
    ]
  },
  "community.card": {
    title: "One solution post",
    lines: [
      "Shows who wrote it, the question it solves and the first part of the solution.",
      "Students get a link into the question hub; teachers and reviewers open the read-only dialog."
    ]
  },
  "community.search": {
    title: "Search solutions",
    lines: [
      "Searches the question, the solution and the author as you type.",
      "It combines with the subject, topic, type and year filters."
    ]
  },
  "community.kind": {
    title: "Question type filter",
    lines: [
      "Narrows the feed to past paper or practice questions.",
      "Practice questions have no year, so choosing them hides the year filter."
    ]
  },
  "community.year": {
    title: "Year filter",
    lines: [
      "Shows only solutions for questions from one past paper year.",
      "It applies to past paper questions only."
    ]
  },
  "community.empty": {
    title: "No matching solutions",
    lines: [
      "Appears when the chosen subject and topic have no posts yet.",
      "It suggests trying another filter rather than leaving a blank page."
    ]
  },
  "postSolution.intro": {
    title: "Post a solution",
    lines: [
      "The route from a question or result screen to the community.",
      "A student picks the question, explains the method and previews the post."
    ]
  },
  "postSolution.form": {
    title: "Solution form",
    lines: [
      "Choose the question being solved, write the method and attach a file if it helps.",
      "When the composer is opened from a question, that question is already chosen."
    ]
  },
  "postSolution.preview": {
    title: "Post preview",
    lines: [
      "Shows the chosen question, the written solution and any attachment.",
      "Nothing is posted until the student confirms."
    ]
  },
  "notes.intro": {
    title: "Teacher notes",
    lines: [
      "Notes shared with the student's own class, grouped by topic.",
      "Only notes from that class appear here."
    ]
  },
  "notes.group": {
    title: "Notes for one topic",
    lines: [
      "Groups the class notes under the topic they belong to.",
      "The subject badge shows which course the topic comes from."
    ]
  },
  "notes.note": {
    title: "One note",
    lines: [
      "Shows the teacher, when it was shared and a short excerpt.",
      "A New badge marks notes the student has not opened yet."
    ]
  },
  "notifications.intro": {
    title: "Notifications",
    lines: [
      "A short list of what changed: shared notes, replies and results.",
      "Each item opens the screen where the student or teacher can act on it."
    ]
  },
  "notifications.item": {
    title: "One notification",
    lines: [
      "Unread items carry a small dot; read items do not.",
      "Opening an item takes you straight to the related screen."
    ]
  },
  "notifications.empty": {
    title: "No notifications",
    lines: [
      "Shown when there is nothing new for this role.",
      "New notes, replies and results will appear here."
    ]
  },
  "dashboard.intro": {
    title: "Teacher dashboard",
    lines: [
      "The teacher's starting point: classes, student counts and class codes.",
      "Each class opens its own detail screen."
    ]
  },
  "dashboard.create": {
    title: "Create class",
    lines: [
      "Starts a new class and gives it a code students can use to join.",
      "No administrator is needed for a class to exist."
    ]
  },
  "dashboard.stats": {
    title: "At a glance",
    lines: [
      "Three numbers: classes, students and items shared this week.",
      "They give a quick sense of the teaching load before the class list."
    ]
  },
  "dashboard.classes": {
    title: "Class list",
    lines: [
      "One card per class, with the student count and class code.",
      "Open a class for its students and shared work."
    ]
  },
  "dashboard.class": {
    title: "One class",
    lines: [
      "The class name, subject, student count and joining code.",
      "Open class shows the students; Share sends them something new."
    ]
  },
  "classes.intro": {
    title: "All classes",
    lines: [
      "The full class list, reached from the Classes tab.",
      "The same cards appear on the dashboard, in a longer view."
    ]
  },
  "classes.create": {
    title: "Create class",
    lines: [
      "Adds a class and gives it a joining code.",
      "The new class appears in the list straight away."
    ]
  },
  "class.intro": {
    title: "Class detail",
    lines: [
      "One class at a time: who is in it, how they are doing and what they have been given.",
      "The class code is shown so the teacher can invite more students."
    ]
  },
  "class.stats": {
    title: "Class summary",
    lines: [
      "How many students are shown, their average progress and how many items are shared.",
      "The prototype shows a sample of the full class."
    ]
  },
  "class.students": {
    title: "Student list",
    lines: [
      "Each student with their progress across the subject.",
      "The bar makes it easy to spot who needs help without reading every number."
    ]
  },
  "class.student": {
    title: "One student",
    lines: [
      "The student's name, when they were last active and their progress.",
      "Progress is a simple percentage, not a predicted grade."
    ]
  },
  "class.shared": {
    title: "Shared with this class",
    lines: [
      "The notes and question sets this class has been given.",
      "Opening one shows what the class actually received."
    ]
  },
  "class.sharedItem": {
    title: "One shared item",
    lines: [
      "A note opens with its full text; a question set lists the questions inside.",
      "It is a record of what was sent, not a new place to edit it."
    ]
  },
  "share.intro": {
    title: "Share with a class",
    lines: [
      "How a teacher hands a note or a set of questions to one or more classes.",
      "Questions come from the whole bank, filtered by subject."
    ]
  },
  "share.form": {
    title: "Share form",
    lines: [
      "Choose the classes, then decide whether to send a note or pick questions.",
      "A title and an optional message go with everything shared."
    ]
  },
  "share.classes": {
    title: "Choose classes",
    lines: [
      "One or more classes can receive the same item.",
      "The student count shows how many people will see it."
    ]
  },
  "share.type": {
    title: "Note or questions",
    lines: [
      "A note is written or uploaded; questions are picked from the bank.",
      "The form changes to show only the fields that apply."
    ]
  },
  "share.note": {
    title: "Write or upload a note",
    lines: [
      "Type the note the class will read, or attach a file instead.",
      "The note is delivered with the title and message."
    ]
  },
  "share.questions": {
    title: "Pick questions",
    lines: [
      "Choose questions from the whole bank, whichever subject the class studies.",
      "Each choice shows its subject, topic, marks and difficulty so the set stays balanced."
    ]
  },
  "share.subjectFilter": {
    title: "Question bank filter",
    lines: [
      "Limits the list to one subject while picking questions.",
      "A question hidden by the filter is unchecked, so it cannot be sent by mistake."
    ]
  },
  "code.intro": {
    title: "Code workspace",
    lines: [
      "A Computer Science question with room to write pseudocode, run it and trace the variables.",
      "It keeps the question in view while the student works."
    ]
  },
  "code.question": {
    title: "The question",
    lines: [
      "The same question, marks and difficulty as the question screen.",
      "The workspace is part of the answer, not a separate topic."
    ]
  },
  "code.editor": {
    title: "Pseudocode editor",
    lines: [
      "The starter code is loaded so the student edits rather than begins from nothing.",
      "Line numbers sit beside the editor and follow the cursor as it scrolls."
    ]
  },
  "code.toolbar": {
    title: "Editor toolbar",
    lines: [
      "Run executes the pseudocode; Review checks it against the steps a marker looks for; Reset puts the starter code back.",
      "The runner and the review are local, rule-based tools, not a real compiler or a live model."
    ]
  },
  "code.review": {
    title: "Code review",
    lines: [
      "Checks the code for the steps this question's mark scheme rewards, plus common mistakes.",
      "It reads structure and names, not meaning: the feedback is rule-based and honest about it."
    ]
  },
  "code.console": {
    title: "Output console",
    lines: [
      "Every OUTPUT line appears here after Run.",
      "Errors name the line and explain what the runner could not read."
    ]
  },
  "code.template": {
    title: "Fixed template",
    lines: [
      "The shape of the answer: declare, read, process, then OUTPUT.",
      "Keeping that shape is what earns the structure marks."
    ]
  },
  "code.inputs": {
    title: "Input values",
    lines: [
      "One value per line, used by each INPUT statement in order.",
      "Sample values are filled in so Run works straight away."
    ]
  },
  "code.dryrun": {
    title: "Dry-run table",
    lines: [
      "One row per step and one column per variable.",
      "Tracing values by hand is how working is shown in Computer Science exams."
    ]
  },
  "code.answer": {
    title: "Final answer",
    lines: [
      "A short written answer to go with the code.",
      "Submitting marks it the same way as any other question."
    ]
  },
  "diagram.intro": {
    title: "Diagram workspace",
    lines: [
      "A Physics question with a diagram the student can adjust before answering.",
      "The question stays visible above the diagram."
    ]
  },
  "diagram.question": {
    title: "The question",
    lines: [
      "The same question, marks and difficulty as the question screen.",
      "The diagram is a tool for understanding the situation, not a separate topic."
    ]
  },
  "diagram.canvas": {
    title: "Adjustable diagram",
    lines: [
      "The angle, mass and friction sliders redraw the plane and resolve the weight.",
      "Reset diagram returns it to the values in the question."
    ]
  },
  "diagram.notes": {
    title: "What the diagram shows",
    lines: [
      "Three short prompts about the physics, not the interface.",
      "They remind the student which parts of the setup matter."
    ]
  },
  "diagram.answer": {
    title: "Your answer",
    lines: [
      "Space for working and the final value.",
      "Submitting marks it the same way as any other question."
    ]
  },
  "chrome.listState": {
    title: "List state",
    lines: [
      "A prototype-only control for previewing how lists behave while loading, when empty, and when something goes wrong.",
      "It applies to the main lists: topics, community, queue, notes, notifications, progress, classes and students."
    ]
  },
  "shell.profile": {
    title: "Profile and settings",
    lines: [
      "Opens the account screen for the current role.",
      "It is the only place where account details are changed."
    ]
  },
  "profile.intro": {
    title: "Profile and settings",
    lines: [
      "The account details for the person using the app.",
      "The role is shown here but is not changed from this screen."
    ]
  },
  "profile.identity": {
    title: "Account summary",
    lines: [
      "Name, email, role and initials in one place.",
      "It gives the student or teacher a clear sense of which account is active."
    ]
  },
  "profile.form": {
    title: "Account form",
    lines: [
      "Change the name or email, then save.",
      "There is no subject choice here: subjects are catalogue areas, not enrolments."
    ]
  },
  "state.loading": {
    title: "Loading state",
    lines: [
      "A quiet placeholder while a list is being fetched.",
      "It keeps the shape of the list so the page does not jump when the content arrives."
    ]
  },
  "state.empty": {
    title: "Empty state",
    lines: [
      "Explains why there is nothing to show and what will appear here.",
      "An empty list should never look like a broken screen."
    ]
  },
  "state.error": {
    title: "Error state",
    lines: [
      "Says what could not load and offers a way to try again.",
      "The rest of the screen stays usable."
    ]
  },
  "placeholder.status": {
    title: "Placeholder screen",
    lines: [
      "This screen belongs to a later phase.",
      "The heading and summary show what it will contain."
    ]
  }
};

/* One note per screen, used by the sitemap rows. */
SCREENS.forEach(function (screen) {
  INSPECT_NOTES["screen." + screen.id] = {
    title: screen.code + " · " + screen.name,
    lines: [screen.note]
  };
});
