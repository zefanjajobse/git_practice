def multiplication(num_1, num_2):
  if num_1 == 0 or num_2 == 0:
    return 0
  else:
    print(num_2)
    return num_1 + multiplication(num_1, num_2 - 1)


# test cases
print(multiplication(3, 7) == 21)
print(multiplication(5, 5) == 25)
print(multiplication(0, 4) == 0)