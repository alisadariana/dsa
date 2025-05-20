# Algorithms

## Introduction: Choosing the Right Algorithm Design Paradigm

Algorithms are systematic procedures for solving problems. This guide covers four major algorithm design paradigms, each with its own strengths, weaknesses, and ideal use cases:

| Paradigm | Core Approach | When to Use | Typical Time Complexity | Example Problems |
|----------|---------------|-------------|-------------------------|------------------|
| **Greedy** | Make locally optimal choices at each step | When local optimality leads to global optimality | O(n log n) | Huffman coding, Prim's MST, Activity selection |
| **Divide & Conquer** | Break problem into subproblems, solve independently, combine | When subproblems are independent | O(n log n) | Merge sort, Binary search, Closest pair of points |
| **Dynamic Programming** | Break into overlapping subproblems, solve once and store | When subproblems overlap and have optimal substructure | O(n²) | Fibonacci, Knapsack, Shortest paths |
| **Backtracking & Branch and Bound** | Incrementally build candidates, abandon invalid paths | When exploring full solution space with constraints | O(b^n) or better with pruning | N-Queens, Sudoku, Traveling Salesman |

### Decision Tree for Selecting a Paradigm

1. **Can you make a locally optimal choice at each step without reconsidering?**
   - Yes → Try **Greedy**
   - No → Continue

2. **Can you break the problem into independent subproblems?**
   - Yes → Try **Divide & Conquer**
   - No → Continue

3. **Does the problem have overlapping subproblems and optimal substructure?**
   - Yes → Try **Dynamic Programming**
   - No → Continue

4. **Do you need to search through a space of potential solutions with constraints?**
   - Yes, and need all valid solutions → Try **Backtracking**
   - Yes, and need optimal solution → Try **Branch and Bound**
   - No → Consider other approaches (e.g., graph algorithms, randomized algorithms)

Remember that many complex problems can be approached using multiple paradigms, often with different trade-offs between implementation complexity, time efficiency, and memory usage.

## Greedy

### Lab08 Summary

#### What is a Greedy Algorithm?

A greedy algorithm builds a solution piece by piece, always choosing the next piece that offers the most immediate benefit. The algorithm never reconsiders its choices - once a decision is made, it's final. It's like hiking a mountain and always walking in the direction of steepest ascent, hoping it leads to the summit.

#### Key Components

- **Candidate set**: The pool of items we can choose from
- **Selection function**: How we pick the "best" candidate at each step
- **Feasibility function**: Checks if adding a candidate maintains a valid solution
- **Objective function**: Measures how good our solution is
- **Solution function**: Tells us when we've found a complete solution

#### Two Implementation Variants

**Variant 1: Try-and-Test**

```text
1. Start with an empty solution set B
2. Select an element from set A
3. If adding it to B leads to a solution, add it
4. Repeat until all elements are considered
```

```c
#define MAXN ? /* suitable value */

/* A = set of nA candidate elements
B = set of nB solution elements */
void greedy1(int A[MAXN], int nA, int B[MAXN], int *nB)
{
        int x, v, i;
        *nB = 0; /* empty solution set */

        for (i = 0; i < nA; i++) {
                select(A, B, i, x);
                /* select x, the first of A[i], A[i + 1], ..., A[n - 1],
                and swap it with element at position i */
                v = checkIfSolution(B, x);
                /* v = 1 if by adding x we get a solution and v = 0 otherwise */
                if (v == 1)
                add2Solution(B, x, *nB);
                /* add x to B, and increase the number of elements in B */
        }
}
```

**Variant 2: Pre-Order-and-Process**

```text
1. Sort/order the elements of set A by some criterion
2. Process elements in this order
3. Add element to solution B if it's feasible
4. Repeat until all elements are processed
```

```c
#define MAXN ? /* suitable value */

/* A = set of nA candidate elements
B = set of nB solution elements */
void greedy2(int A[MAXN], int nA, int B[MAXN], int *nB)
{
        int x, v, i;
        *nB = 0; /* empty solution set */
        process(A, nA); /* rearrange A */
        for (i = 0; i < nA; i++) {
                x = A[i];
                checkIfSolution(B, x, v);
                /* v = 1 if by adding x we get a solution and v = 0 otherwise */
                if (v == 1)
                add2Solution(B, x, *nB);
                /* add x to B, and increase the number of elements in B */
        }
}
```

#### Real-World Examples

- **Prim's Algorithm**: Builds a minimum spanning tree by always adding the cheapest edge that connects a new vertex
- **Job Sequencing**: Schedules jobs to maximize profit by prioritizing high-profit jobs with closer deadlines

#### When to Use Greedy Algorithms

- When a locally optimal choice leads to a globally optimal solution
- When the problem has "optimal substructure" (optimal solution contains optimal solutions to subproblems)
- When making a greedy choice reduces the problem to a smaller instance of the same problem

Greedy algorithms are efficient but don't always find the optimal solution for every problem. They work well when the problem has a "greedy property" - local optimality leads to global optimality.

### Lab08 Assignment

- Run Job Sequencing Code from lab pdf
- Fractional Knapsack Greedy
- 0/1 Knapsack Greedy

## Divide and Conquest

### Lab09 Summary

#### What is Divide and Conquer?

Divide and Conquer is a problem-solving strategy that breaks a complex problem into smaller, manageable subproblems, solves each subproblem independently, and then combines these solutions to solve the original problem. It's like taking apart a complex machine to fix each component separately, then reassembling it.

#### The Three Key Steps

**1. Divide**
Split the original problem into smaller subproblems of the same type.

```text
Divide(p, q, m) → Find a way to split the problem between indices p and q at point m
```

**2. Conquer**
Solve each subproblem recursively. When the subproblems become simple enough (reaching a "base case"), solve them directly.

```text
DivideAndConquer(p, m, β) → Solve first subproblem
DivideAndConquer(m+1, q, γ) → Solve second subproblem
```

**3. Combine**
Merge the solutions of the subproblems to create the solution to the original problem.

```text
Combine(β, γ, α) → Combine solutions to get final answer
```

#### General Recursive Structure

```c
void DivideAndConquer(int p, int q, SolutionT α)
{
    int ε, m;
    SolutionT β, γ; // intermediate results
    
    if (abs(q - p) ≤ ε) 
        process(p, q, α); // Base case: problem is small enough to solve directly
    else {
        Divide(p, q, m);  // Split problem at point m
        DivideAndConquer(p, m, β);  // Solve first part
        DivideAndConquer(m + 1, q, γ);  // Solve second part
        Combine(β, γ, α);  // Merge solutions
    }
}
```

#### Classic Examples

**Merge Sort**

- **Divide**: Split array in half
- **Conquer**: Recursively sort both halves
- **Combine**: Merge sorted halves into a single sorted array

**Finding Closest Pair of Points**

- **Divide**: Split points into two sets by x-coordinate
- **Conquer**: Find closest pair in each half
- **Combine**: Check if there's a closer pair with points from both halves

#### When to Use Divide and Conquer

- When a problem can be naturally broken into similar subproblems
- When subproblems are independent (solutions don't affect each other)
- When solutions to subproblems can be efficiently combined
- When the problem exhibits overlapping subproblems, but you don't need to store intermediate results

#### Benefits

- Often leads to efficient algorithms (many have O(n log n) complexity)
- Naturally translates to recursive implementations
- Can be parallelized, as subproblems can be solved independently

Divide and Conquer works because it reduces complex problems to simpler versions of themselves, enabling solutions to be built from the ground up.

### Code

```c
#include <stdio.h>

void printArray(int *array, int n)
{
        for (int i = 0; i < n; i++)
                printf("%d ", array[i]);
        printf("\n");
}

// [3, 27, 38, 43, 9, 10, 82]

// left part: 3, 27, 38, 43 <- i
// right part: 9, 10, 82 <- j
// merged array <- k

// [3, 9, 10, 27, 38, 43, 82]
void merge(int *array, int leftBound, int mid, int rightBound)
{
        int mergedArray[rightBound - leftBound + 1];
        int i, j, k, l;

        i = leftBound;
        j = mid + 1;
        k = 0;

        while (i <= mid && j <=rightBound) {
                if (array[i] < array[j])
                {
                        mergedArray[k] = array[i];
                        i++;
                        k++;
                } else {
                        mergedArray[k] = array[j];
                        j++;
                        k++;
                }
        }

        // leftover elements on left
        for (l = i; l <= mid; l++) {
                mergedArray[k] = array[l];
                k++;
        }

        // leftover elements on right
        for (l = j; l <= rightBound; l++) {
                mergedArray[k] = array[l];
                k++;
        }

        // copy to output array
        for (l = leftBound; l <= rightBound; l++) {
                array[l] = mergedArray[l - leftBound];
        }

        return;
}

void mergeSort(int *array, int leftBound, int rightBound)
{
        int mid;

        if (leftBound < rightBound)
        {
                // divide
                mid = (leftBound + rightBound) / 2;
                printArray(array, rightBound - leftBound + 1);

                // conquer
                mergeSort(array, leftBound, mid);
                mergeSort(array, mid + 1, rightBound);

                // combine
                merge(array, leftBound, mid, rightBound);
        }
}

int main()
{
        int array[] = { 38, 27, 43, 3, 9, 82, 10 };
                      //0,  1,  2,  3, 4, 5,  6
        int leftBound = 0;
        int rightBound = 6;

        mergeSort(array, leftBound, rightBound);

        for (int i = leftBound; i <= rightBound; i++)
        {
                printf("%d ", array[i]);
        }

        return 0;
}
```

## Dynammic Programming

### Lab10 Summary

#### What is Dynamic Programming?

Dynamic Programming (DP) is a method for solving complex problems by breaking them down into simpler subproblems and solving each subproblem just once, storing its solution. It's like solving a puzzle by first figuring out smaller sections and then using those solutions to solve the whole thing.

Think of it as "remembering to avoid repeating work" - DP trades memory for speed by storing results of subproblems to avoid recalculating them.

#### The Key Principles of Dynamic Programming

1. **Optimal Substructure**: An optimal solution contains optimal solutions to its subproblems
   - Example: The shortest path from A to C through B contains the shortest path from A to B

2. **Overlapping Subproblems**: The same subproblems are solved multiple times
   - Example: In Fibonacci, F(n) = F(n-1) + F(n-2), calculating F(5) requires F(4) and F(3), but F(4) also requires F(3)

#### Development Process for DP Algorithms

1. **Characterize Structure**: Identify how an optimal solution can be constructed from optimal solutions of subproblems

2. **Define Value Recursively**: Create a recurrence relation that expresses the value of an optimal solution

3. **Compute Bottom-Up**: Fill a table with solutions to subproblems, starting from smallest

4. **Construct Solution**: Use the table to build the final solution

#### Two Main Approaches to Dynamic Programming

**Bottom-Up (Tabulation)**

- Start with smallest subproblems and work up to the original problem
- Usually uses an array or table to store results
- Typically uses iteration (loops)
- Guaranteed to solve all necessary subproblems

**Top-Down (Memoization)**

- Start with the original problem and solve recursively
- Store results in a lookup table to avoid recalculating
- Uses recursion with added memory
- Solves only necessary subproblems

#### Classic Examples of Dynamic Programming

**Matrix Chain Multiplication**

- Problem: Find the most efficient way to multiply a sequence of matrices
- DP approach: Calculate optimal costs for multiplying subsequences of matrices

**0-1 Knapsack Problem**

- Problem: Select items with weights and values to maximize value while keeping total weight under a limit
- DP approach: Build a table where DP[i][w] represents the maximum value for first i items with weight limit w

#### When to Use Dynamic Programming

- When a problem can be broken down into overlapping subproblems
- When the problem has optimal substructure
- When you need to find the optimal solution (maximum, minimum, exact count, etc.)
- When a greedy approach doesn't work because local optimality doesn't lead to global optimality

#### Comparing with Other Techniques

- **vs. Divide and Conquer**: Both break problems into smaller ones, but DP reuses solutions to subproblems that overlap
- **vs. Greedy**: DP examines all possible ways to solve a problem, while greedy makes locally optimal choices
- **vs. Brute Force**: DP intelligently explores the solution space, while brute force examines all possibilities

Dynamic Programming excels when we need to find the optimal way to solve a problem and can identify a recursive structure with overlapping subproblems.

### Recursive Fibonacci vs DP Fibonacci

#### The Fibonacci Problem

The Fibonacci sequence is defined as:

- F(0) = 0
- F(1) = 1
- F(n) = F(n-1) + F(n-2) for n > 1

#### Approach 1: Simple Recursion

```c
int fibonacci_recursive(int n) {
    // Base cases
    if (n <= 0) return 0;
    if (n == 1) return 1;
    
    // Recursive case
    return fibonacci_recursive(n-1) + fibonacci_recursive(n-2);
}
```

**Analysis**:

- Simple and directly follows the mathematical definition
- Extremely inefficient for larger values of n
- Time Complexity: O(2^n) - exponential growth
- Space Complexity: O(n) for the recursive call stack
- For n = 40, this makes over 200 million recursive calls!

Here's a simple visualization of the recursive tree for calculating F(5):

```text
                   F(5)
                 /      \
            F(4)          F(3)
          /     \        /    \
      F(3)      F(2)   F(2)   F(1)
     /   \     /   \   /  \
  F(2)   F(1) F(1) F(0) F(1) F(0)
 /   \
F(1) F(0)
```

In this tree, notice how F(3) is calculated twice, F(2) is calculated three times, and F(1) is calculated five times. This redundant calculation gets exponentially worse for larger values of n.

#### Approach 2: Dynamic Programming (Top-Down with Memoization)

```c
int fibonacci_memoization(int n, int *memo) {
    // Base cases
    if (n <= 0) return 0;
    if (n == 1) return 1;
    
    // If we've already calculated this value, return it
    if (memo[n] != -1) return memo[n];
    
    // Calculate and store the result
    memo[n] = fibonacci_memoization(n-1, memo) + fibonacci_memoization(n-2, memo);
    return memo[n];
}

int fibonacci_dp_topdown(int n) {
    // Initialize memoization array with -1 (indicating uncalculated)
    int *memo = (int *)malloc((n+1) * sizeof(int));
    for (int i = 0; i <= n; i++) memo[i] = -1;
    
    int result = fibonacci_memoization(n, memo);
    free(memo);
    return result;
}
```

**Analysis**:

- Keeps the recursive structure but avoids recalculating values
- Time Complexity: O(n) - each value calculated only once
- Space Complexity: O(n) for the memo array and call stack
- Dramatically faster for large n

#### Approach 3: Dynamic Programming (Bottom-Up with Tabulation)

```c
int fibonacci_dp_bottomup(int n) {
    if (n <= 0) return 0;
    if (n == 1) return 1;
    
    // Create table to store results
    int *fib = (int *)malloc((n+1) * sizeof(int));
    
    // Base cases
    fib[0] = 0;
    fib[1] = 1;
    
    // Fill the table bottom-up
    for (int i = 2; i <= n; i++) {
        fib[i] = fib[i-1] + fib[i-2];
    }
    
    int result = fib[n];
    free(fib);
    return result;
}
```

**Analysis**:

- Iterative approach that builds up from the base cases
- Time Complexity: O(n) - linear time
- Space Complexity: O(n) for the table
- Usually faster than memoization due to lack of recursive overhead

#### Approach 4: Space-Optimized DP Solution

```c
int fibonacci_optimized(int n) {
    if (n <= 0) return 0;
    if (n == 1) return 1;
    
    int a = 0, b = 1, c;
    
    for (int i = 2; i <= n; i++) {
        c = a + b;
        a = b;
        b = c;
    }
    
    return b;
}
```

**Analysis**:

- Uses only two variables instead of an array
- Time Complexity: O(n) - linear time
- Space Complexity: O(1) - constant space
- The most efficient solution overall

#### Performance Comparison

| n    | Recursive       | DP (Memoization) | DP (Bottom-Up) | Optimized DP |
|------|-----------------|------------------|----------------|--------------|
| 10   | < 1ms           | < 1ms            | < 1ms          | < 1ms        |
| 30   | ~20 minutes     | < 1ms            | < 1ms          | < 1ms        |
| 45   | Years           | < 1ms            | < 1ms          | < 1ms        |

This dramatic difference illustrates the power of dynamic programming - by storing and reusing solutions to subproblems, we transform an exponential-time algorithm into a linear-time one.

#### The Key Insight

The plain recursive approach recalculates the same values over and over, while dynamic programming calculates each value exactly once. This is the essence of dynamic programming: **solve each subproblem once and save its answer in a table, rather than recomputing the answer every time the subproblem is encountered**.

### Lab10 Assignments

- Understand Fibonacci Recursive vs DP
- Understand Knapsack DP
- Implement Knapsack DP code

### Lab10 Code

```c
#include <stdio.h>

// W = 4 (kg)
// w = 3 | 2 | 2  (kg)
// v = 5 | 3 | 3  (ron)

typedef struct itemT
{
        int weight;
        int value;
} item;

int main()
{
        int itemNumber = 3;
        int W = 4; // kg

        item i1;
        i1.weight = 3;
        i1.value = 5;

        item i2;
        i2.weight = 2;
        i2.value = 3;

        item i3;
        i3.weight = 2;
        i3.value = 3;

        item items[itemNumber];

        items[0] = i1;
        items[1] = i2;
        items[2] = i3;

        int dp[itemNumber + 1][W + 1]; // store values

        for (int i = 0; i < itemNumber + 1; i++)
                for (int j = 0; j < W + 1; j++)
                        dp[i][j] = 0;

        for (int i = 1; i < itemNumber + 1; i++) {
                for (int j = 1; j < W + 1; j++) {
                        item currentItem = items[i-1];

                        // check if item fits in 
                        if (currentItem.weight <= j) {
                                // better to take item or not?
                                // <= compare best value with item vs without item
                                int takeItem = (currentItem.value + dp[i-1][j-currentItem.weight]) > (dp[i-1][j]);

                                if (takeItem) {
                                        dp[i][j] = currentItem.value + dp[i-1][j-currentItem.weight];
                                } else {
                                        dp[i][j] = dp[i-1][j];
                                }
                        }
                }
        }

        for (int i = 0; i < itemNumber + 1; i++) {
                for (int j = 0; j < W + 1; j++) {
                        printf("%d ", dp[i][j]);
                }
                printf("\n");
        }
}
```

## Backtracking

### Lab11 Summary

#### What is Backtracking?

Backtracking is a systematic way to explore all possible solutions to a problem by incrementally building candidates and abandoning those that fail to satisfy the problem constraints. It's like navigating a maze where you explore each path until you hit a dead end, then "backtrack" to the last decision point and try a different path.

Think of it as a depth-first search through the tree of possible solutions, with pruning of branches that can't lead to valid solutions.

#### How Backtracking Works

1. **Build** solutions incrementally, one piece at a time
2. **Test** if a partial solution satisfies all constraints
3. If it fails, **abandon** that path (backtrack)
4. If it passes, **continue** adding more elements
5. If it's complete, **report** the solution and continue searching

#### Key Elements of Backtracking

- **Solution Vector X = (x₁, x₂, ..., xₙ)**: The elements we're trying to determine
- **Sets S₁, S₂, ..., Sₙ**: Possible values for each element of X
- **Internal Relation φ**: Constraint that determines valid solutions
- **Continuation Condition**: Test that determines if a partial solution is worth extending

#### Two Implementation Approaches

**Non-Recursive Approach**

```c
void nonRecBackTrack(int n) {
    int x[MAXN];
    int k, v;
    
    k = 1;  // Start with first element
    while (k > 0) {
        v = 0;
        // Try each possible value for x[k]
        while (there's an untested value α in set Sₖ && v == 0) {
            x[k] = α;
            // Check if this partial solution can lead to a full solution
            if (φ(x[1], x[2],..., x[k]))
                v = 1;
        }
        
        if (v == 0)
            k--;  // Backtrack to previous element
        else if (k == n)
            listOrProcess(x, n);  // Found a solution
        else
            k++;  // Move to next element
    }
}
```

**Recursive Approach**

```c
int x[MAXN];  // Global solution vector

void recBackTrack(int k) {
    for (int j = 1; j <= nS[k]; j++) {
        x[k] = Sₖ[j];  // Try jth element of set Sₖ
        
        if (φ(x[1], x[2],..., x[k]))  // Test if valid so far
            if (k < n)
                recBackTrack(k + 1);  // Recursively try next element
            else
                listOrProcess(x, n);  // Found a solution
    }
}
```

#### Classic Example: The n Queens Problem

The challenge is to place n queens on an n×n chessboard so that no queen threatens another (no two queens on the same row, column, or diagonal).

**Key Insights:**

- Each queen must be on a different row and column
- The solution is represented as X = (x₁, x₂, ..., xₙ), where xᵢ = column position of queen on row i
- Continuation condition: |k-i| ≠ |x[k]-x[i]| for all previous rows i (no diagonal threats)

This problem demonstrates backtracking's power to efficiently explore a large solution space by pruning invalid paths early.

#### When to Use Backtracking

- When you need to find all possible solutions to a problem
- When a problem can be solved by making a sequence of decisions
- When each decision restricts future choices
- When many potential solutions can be eliminated without being fully explored

Backtracking is particularly useful for constraint satisfaction problems, puzzles, and combinatorial problems where exhaustive search would be impractical.

---

#### What is Branch and Bound?

Branch and Bound is related to backtracking but focuses on finding the optimal solution rather than all solutions. It systematically explores the solution space while using bounds on the objective function to prune unpromising paths.

The key difference from backtracking is the order of traversal - Branch and Bound typically uses best-first search guided by a cost function, while backtracking uses depth-first search.

#### Core Components of Branch and Bound

1. **Branching**: Dividing a problem into subproblems
2. **Bounding**: Calculating bounds on possible solutions to prune branches
3. **Search Strategy**: Selecting which nodes to explore next (typically best-cost)

#### Branch and Bound Algorithm Framework

```c
boolean branchAndBound() {
    eNode = new(node);  // Root node (start state)
    H = createHeap();   // Heap for live nodes (priority queue)
    
    while (true) {
        if (eNode is a final leaf) {
            // eNode is an optimal solution
            print out the path from eNode to the root;
            return true;
        }
        
        expand(eNode);  // Generate children
        
        if (H is empty) {
            // No solution exists
            return false;
        }
        
        eNode = deleteTop(H);  // Get most promising node
    }
}

void expand(e) {
    Generate all the children of e;
    Compute the approximate cost value ĉ of each child;
    Insert each child into the heap H;
}
```

#### Key Differences Between Backtracking and Branch and Bound

| Aspect | Backtracking | Branch and Bound |
|--------|--------------|-----------------|
| Goal | Find all solutions | Find optimal solution |
| Traversal | Depth-first search | Best-first search |
| Pruning Based On | Constraint violations | Cost function bounds |
| Memory Usage | Lower (DFS) | Higher (priority queue) |
| When to Use | Constraint satisfaction | Optimization problems |

#### Example Application: PERSPICO Puzzle

The PERSPICO puzzle (15-tile sliding puzzle) is a classic problem that can be solved with Branch and Bound:

- **State**: Current arrangement of tiles
- **Goal**: Target arrangement of tiles
- **Cost Function**: Number of moves plus heuristic (e.g., Manhattan distance)
- **Branching**: Sliding a tile into the empty space
- **Bounding**: Estimated minimum cost to reach goal

Branch and Bound is ideal here because we want the shortest solution path, not all possible paths.

#### When to Use Branch and Bound

- When searching for an optimal solution (not just any solution)
- When you can define a cost function to guide the search
- When you can efficiently compute bounds for partial solutions
- When the problem has a tree or graph structure of states and transitions

Branch and Bound is powerful for solving optimization problems like shortest path, traveling salesman, job scheduling, and resource allocation.

### Lab11 Assignments

- Understand Knapsack Backtracking
- Implement Backtracking for any chosen domain
