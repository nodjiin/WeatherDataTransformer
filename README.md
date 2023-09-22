# Disclaimer

Given that the challenge did not provide specific guidelines on the program's structure, I decided to construct my solution as a CLI tool. This approach can be really efficient when handling tasks that manipulate a defined set of input data, as the tool can be easily parallelized and piped between varied operations.

# Input/Output Mechanism

The tool can accept input data either from a file (through the flags -i \ --input-file) or directly from stdin (default). Similarly, the output can be directed to a file (through the flags -o \ --output-file) or to stdout(default).

# External Libraries/Packages

-   **Commander**: Used for handling input arguments (maibe overkill given the scope of the tool).
-   **Zod**: Deployed for robust input data validation.
-   **Moment.js**: Employed for precise date format validation.

# Project Structure

All the source code for the project is located in the **src** folder, which has the following format:

```
src
├───modules
│   ├───io
│   ├───log
│   └───weather
└───types
```

-   The **io** module contains all the logic needed for reading, parsing, and validating the input, as well as writing the output.
-   The **weather** module contains the logic required to transform the input as per the challenge's requirements.
-   The **log** modulecontains a simple utility for logging generic errors.

The starting point of the project is index.ts, which is directly placed inside the src directory.

# Instructions

-   **Build**: Execute `npm run build`.
-   **Running Tests**: Use `npm run test`, or `npm run test:unit` \ `npm run test:integration` for the specific subset.
-   **Sample Execution**: To run the tool with example input, use the following command:

```
node .\dist\index.js -i tests\data\weather.json -s "2023-09-10 12:00 AM" -e "2023-09-13 12:00 AM"
```
