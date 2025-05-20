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
