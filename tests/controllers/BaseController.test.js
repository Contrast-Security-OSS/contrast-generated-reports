/**
 * BaseController Tests
 * Tests for the base Controller class that handles data transformation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { BaseController } from '@/controllers/BaseController.js';

describe('BaseController', () => {
  describe('Initialization', () => {
    it('should create a BaseController instance', () => {
      const controller = new BaseController();
      expect(controller).toBeInstanceOf(BaseController);
    });
  });

  describe('Data Transformation Utilities', () => {
    it('should transform array of objects', () => {
      const controller = new BaseController();
      const data = [
        { name: 'item1', value: 10 },
        { name: 'item2', value: 20 }
      ];

      const result = controller.transform(data, (item) => ({
        ...item,
        doubled: item.value * 2
      }));

      expect(result).toHaveLength(2);
      expect(result[0].doubled).toBe(20);
      expect(result[1].doubled).toBe(40);
    });

    it('should filter array based on predicate', () => {
      const controller = new BaseController();
      const data = [
        { name: 'item1', active: true },
        { name: 'item2', active: false },
        { name: 'item3', active: true }
      ];

      const result = controller.filter(data, (item) => item.active);

      expect(result).toHaveLength(2);
      expect(result.every(item => item.active)).toBe(true);
    });

    it('should sort array by property', () => {
      const controller = new BaseController();
      const data = [
        { name: 'Charlie', score: 85 },
        { name: 'Alice', score: 95 },
        { name: 'Bob', score: 90 }
      ];

      const result = controller.sortBy(data, 'score', 'desc');

      expect(result[0].name).toBe('Alice');
      expect(result[1].name).toBe('Bob');
      expect(result[2].name).toBe('Charlie');
    });

    it('should sort array ascending by default', () => {
      const controller = new BaseController();
      const data = [
        { name: 'Charlie', score: 85 },
        { name: 'Alice', score: 95 },
        { name: 'Bob', score: 90 }
      ];

      const result = controller.sortBy(data, 'score');

      expect(result[0].score).toBe(85);
      expect(result[1].score).toBe(90);
      expect(result[2].score).toBe(95);
    });

    it('should group array by property', () => {
      const controller = new BaseController();
      const data = [
        { name: 'item1', category: 'A' },
        { name: 'item2', category: 'B' },
        { name: 'item3', category: 'A' }
      ];

      const result = controller.groupBy(data, 'category');

      expect(result.A).toHaveLength(2);
      expect(result.B).toHaveLength(1);
    });

    it('should aggregate numeric values', () => {
      const controller = new BaseController();
      const data = [
        { name: 'item1', value: 10 },
        { name: 'item2', value: 20 },
        { name: 'item3', value: 30 }
      ];

      const sum = controller.sum(data, 'value');
      const avg = controller.average(data, 'value');
      const min = controller.min(data, 'value');
      const max = controller.max(data, 'value');

      expect(sum).toBe(60);
      expect(avg).toBe(20);
      expect(min).toBe(10);
      expect(max).toBe(30);
    });
  });

  describe('Data Validation', () => {
    it('should validate required fields', () => {
      const controller = new BaseController();
      const data = { name: 'test', value: 123 };
      const requiredFields = ['name', 'value'];

      const result = controller.validateRequired(data, requiredFields);

      expect(result.valid).toBe(true);
      expect(result.missing).toHaveLength(0);
    });

    it('should detect missing required fields', () => {
      const controller = new BaseController();
      const data = { name: 'test' };
      const requiredFields = ['name', 'value', 'category'];

      const result = controller.validateRequired(data, requiredFields);

      expect(result.valid).toBe(false);
      expect(result.missing).toEqual(['value', 'category']);
    });

    it('should validate data types', () => {
      const controller = new BaseController();
      const data = {
        name: 'test',
        count: 123,
        active: true,
        tags: ['a', 'b']
      };

      expect(controller.isString(data.name)).toBe(true);
      expect(controller.isNumber(data.count)).toBe(true);
      expect(controller.isBoolean(data.active)).toBe(true);
      expect(controller.isArray(data.tags)).toBe(true);
    });

    it('should validate ranges', () => {
      const controller = new BaseController();

      expect(controller.inRange(5, 1, 10)).toBe(true);
      expect(controller.inRange(0, 1, 10)).toBe(false);
      expect(controller.inRange(11, 1, 10)).toBe(false);
    });

    it('should validate against patterns', () => {
      const controller = new BaseController();
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      expect(controller.matches('test@example.com', emailPattern)).toBe(true);
      expect(controller.matches('invalid-email', emailPattern)).toBe(false);
    });
  });

  describe('Data Merging', () => {
    it('should merge two objects', () => {
      const controller = new BaseController();
      const obj1 = { a: 1, b: 2 };
      const obj2 = { b: 3, c: 4 };

      const result = controller.merge(obj1, obj2);

      expect(result).toEqual({ a: 1, b: 3, c: 4 });
    });

    it('should deep merge nested objects', () => {
      const controller = new BaseController();
      const obj1 = { a: 1, nested: { x: 10, y: 20 } };
      const obj2 = { b: 2, nested: { y: 30, z: 40 } };

      const result = controller.deepMerge(obj1, obj2);

      expect(result.nested).toEqual({ x: 10, y: 30, z: 40 });
    });

    it('should merge arrays of objects by key', () => {
      const controller = new BaseController();
      const arr1 = [
        { id: 1, name: 'Alice', score: 85 },
        { id: 2, name: 'Bob', score: 90 }
      ];
      const arr2 = [
        { id: 1, grade: 'B' },
        { id: 2, grade: 'A' },
        { id: 3, name: 'Charlie', grade: 'C' }
      ];

      const result = controller.mergeArrays(arr1, arr2, 'id');

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({ id: 1, name: 'Alice', score: 85, grade: 'B' });
      expect(result[1]).toEqual({ id: 2, name: 'Bob', score: 90, grade: 'A' });
      expect(result[2]).toEqual({ id: 3, name: 'Charlie', grade: 'C' });
    });

    it('should join arrays by foreign key', () => {
      const controller = new BaseController();
      const users = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' }
      ];
      const orders = [
        { orderId: 101, userId: 1, amount: 50 },
        { orderId: 102, userId: 2, amount: 75 },
        { orderId: 103, userId: 1, amount: 30 }
      ];

      const result = controller.join(users, orders, 'id', 'userId');

      expect(result).toHaveLength(3);
      // Join iterates left array first, so Alice's orders come before Bob's
      expect(result[0].name).toBe('Alice');
      expect(result[0].amount).toBe(50);
      expect(result[1].name).toBe('Alice');
      expect(result[1].amount).toBe(30);
      expect(result[2].name).toBe('Bob');
      expect(result[2].amount).toBe(75);
    });
  });

  describe('Error Handling', () => {
    it('should handle transformation errors gracefully', () => {
      const controller = new BaseController();
      const data = [{ value: 10 }, { value: 'invalid' }, { value: 20 }];

      const result = controller.safeTransform(data, (item) => {
        if (typeof item.value !== 'number') {
          throw new Error('Invalid value');
        }
        return item.value * 2;
      });

      expect(result.successful).toHaveLength(2);
      expect(result.failed).toHaveLength(1);
      expect(result.successful).toEqual([20, 40]);
    });

    it('should provide default values for missing data', () => {
      const controller = new BaseController();
      const data = { name: 'test' };

      const result = controller.withDefaults(data, {
        name: 'default',
        value: 0,
        active: true
      });

      expect(result.name).toBe('test');
      expect(result.value).toBe(0);
      expect(result.active).toBe(true);
    });

    it('should sanitize data by removing undefined/null', () => {
      const controller = new BaseController();
      const data = {
        name: 'test',
        value: 0,
        empty: null,
        missing: undefined,
        active: false
      };

      const result = controller.sanitize(data);

      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('value');
      expect(result).toHaveProperty('active');
      expect(result).not.toHaveProperty('empty');
      expect(result).not.toHaveProperty('missing');
    });
  });

  describe('Utility Methods', () => {
    it('should check if array is empty', () => {
      const controller = new BaseController();

      expect(controller.isEmpty([])).toBe(true);
      expect(controller.isEmpty([1, 2])).toBe(false);
      expect(controller.isEmpty(null)).toBe(true);
      expect(controller.isEmpty(undefined)).toBe(true);
    });

    it('should get unique values from array', () => {
      const controller = new BaseController();
      const data = [1, 2, 2, 3, 3, 3, 4];

      const result = controller.unique(data);

      expect(result).toEqual([1, 2, 3, 4]);
    });

    it('should flatten nested arrays', () => {
      const controller = new BaseController();
      const data = [1, [2, 3], [4, [5, 6]]];

      const result = controller.flatten(data);

      expect(result).toEqual([1, 2, 3, 4, 5, 6]);
    });

    it('should pick specific properties from object', () => {
      const controller = new BaseController();
      const data = { a: 1, b: 2, c: 3, d: 4 };

      const result = controller.pick(data, ['a', 'c']);

      expect(result).toEqual({ a: 1, c: 3 });
    });

    it('should omit specific properties from object', () => {
      const controller = new BaseController();
      const data = { a: 1, b: 2, c: 3, d: 4 };

      const result = controller.omit(data, ['b', 'd']);

      expect(result).toEqual({ a: 1, c: 3 });
    });
  });

  describe('Performance', () => {
    it('should handle large datasets efficiently', () => {
      const controller = new BaseController();
      const largeData = Array.from({ length: 10000 }, (_, i) => ({
        id: i,
        value: Math.random() * 100
      }));

      const start = Date.now();
      const filtered = controller.filter(largeData, (item) => item.value > 50);
      const sorted = controller.sortBy(filtered, 'value');
      const elapsed = Date.now() - start;

      expect(sorted.length).toBeGreaterThan(0);
      expect(elapsed).toBeLessThan(1000); // Should complete in less than 1 second
    });
  });
});
