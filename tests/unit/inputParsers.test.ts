import { safeParseInputFilename } from '../../src/modules/io/inputParsers'

describe('inputParsers', () => {
    describe('safeParseInputFilename', () => {
        beforeEach(() => {
            console.error = jest.fn()
        })

        it('should return null for non-string values', () => {
            expect(safeParseInputFilename(123 as any)).toBeNull()
            expect(safeParseInputFilename(null as any)).toBeNull()
            expect(safeParseInputFilename(undefined as any)).toBeNull()
        })

        it('should reject file names with disallowed extensions', () => {
            const result = safeParseInputFilename('testfile.disallowed')
            expect(result).toBeNull()
        })

        it('should reject file names with forbidden characters', () => {
            const result = safeParseInputFilename('test~file.txt')
            expect(result).toBeNull()
        })

        it('should reject file names attempting directory traversal', () => {
            const result = safeParseInputFilename('../testfile.txt')
            expect(result).toBeNull()
        })

        it('should return full path for valid filenames', () => {
            const result = safeParseInputFilename('testfile.txt')
            expect(result).toContain('testfile.txt')
        })
    })
})
