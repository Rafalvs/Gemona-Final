import { useState } from 'react';

/**
 * Hook personalizado para gerenciar formulários com validação
 * 
 * 
 * @param {object} initialState - Estado inicial do formulário
 * @param {function} validationFunction - Função de validação a ser usada
 * @returns {object} - Objeto com estado e funções do formulário
 */
export const useForm = (initialState, validationFunction) => {
    const [formData, setFormData] = useState(initialState);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Função para atualizar campos do formulário
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Limpar erro do campo quando usuário começar a digitar
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    // Função para validar formulário
    const validateForm = () => {
        if (validationFunction) {
            const erros = validationFunction(formData);
            setErrors(erros);
            return Object.keys(erros).length === 0;
        }
        return true;
    };

    // Função para resetar formulário
    const resetForm = () => {
        setFormData(initialState);
        setErrors({});
        setMessage('');
    };

    // Função para definir mensagem
    const setFormMessage = (msg) => {
        setMessage(msg);
    };

    // Função para definir loading
    const setFormLoading = (loadingState) => {
        setLoading(loadingState);
    };

    // Função para definir erros específicos
    const setFormErrors = (newErrors) => {
        setErrors(newErrors);
    };

    return {
        formData,
        errors,
        loading,
        message,
        handleInputChange,
        validateForm,
        resetForm,
        setFormMessage,
        setFormLoading,
        setFormErrors,
        setFormData
    };
};