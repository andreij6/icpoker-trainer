import { describe, it, expect } from 'vitest';
import { generatePlayerNames, generateSingleName } from '../src/utils/nameGenerator';

describe('Name Generator', () => {
  describe('generatePlayerNames', () => {
    it('should generate the requested number of names', () => {
      const names = generatePlayerNames(8);
      expect(names).toHaveLength(8);
    });

    it('should generate unique names', () => {
      const names = generatePlayerNames(8);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(8);
    });

    it('should generate names with first and last name', () => {
      const names = generatePlayerNames(5);
      names.forEach(name => {
        const parts = name.split(' ');
        expect(parts.length).toBe(2);
        expect(parts[0].length).toBeGreaterThan(0);
        expect(parts[1].length).toBeGreaterThan(0);
      });
    });

    it('should throw error if requesting too many names', () => {
      expect(() => generatePlayerNames(100)).toThrow();
    });

    it('should generate different names on different calls', () => {
      const names1 = generatePlayerNames(8);
      const names2 = generatePlayerNames(8);
      
      // At least one name should be different (very high probability)
      const hasDifference = names1.some((name, index) => name !== names2[index]);
      expect(hasDifference).toBe(true);
    });
  });

  describe('generateSingleName', () => {
    it('should generate a name with first and last name', () => {
      const name = generateSingleName();
      const parts = name.split(' ');
      expect(parts.length).toBe(2);
      expect(parts[0].length).toBeGreaterThan(0);
      expect(parts[1].length).toBeGreaterThan(0);
    });

    it('should generate different names on multiple calls', () => {
      const names = new Set<string>();
      for (let i = 0; i < 20; i++) {
        names.add(generateSingleName());
      }
      // With 40 first names and 40 last names, we should get variety
      expect(names.size).toBeGreaterThan(10);
    });
  });
});

