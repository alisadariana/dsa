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
